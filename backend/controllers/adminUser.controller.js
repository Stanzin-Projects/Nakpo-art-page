import mongoose from 'mongoose';
import User from '../models/User.model.js';
import Order from '../models/Order.model.js';
import Notification from '../models/Notification.model.js';
import Review from '../models/Review.model.js';
import { sendEmail } from '../utils/mailer.js';
import { accountDeactivatedEmail } from '../emails/templates.js';

const emailRx = (value) => new RegExp(String(value).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

/**
 * Every account, with its order count and lifetime spend.
 * Orders are matched on the account id first, so guests keep their own rows.
 */
export async function listUsers(req, res) {
  try {
    const { q, role, status } = req.query;

    const filter = {};
    if (q) {
      const rx = emailRx(q);
      filter.$or = [{ name: rx }, { email: rx }];
    }
    if (role === 'admin') filter.isAdmin = true;
    if (role === 'buyer') filter.isAdmin = { $ne: true };
    if (status === 'active') filter.isActive = { $ne: false };
    if (status === 'inactive') filter.isActive = false;

    const users = await User.find(filter).sort({ createdAt: -1 }).limit(500);

    const ids = users.map((u) => u._id);
    const spend = await Order.aggregate([
      { $match: { user: { $in: ids } } },
      {
        $group: {
          _id: '$user',
          orders: { $sum: 1 },
          spent: { $sum: '$total' },
          lastOrderAt: { $max: '$createdAt' },
        },
      },
    ]);

    const byUser = spend.reduce((acc, s) => ({ ...acc, [String(s._id)]: s }), {});

    res.json(
      users.map((u) => {
        const s = byUser[String(u._id)] || {};
        return {
          id: u._id,
          name: u.name,
          email: u.email,
          isAdmin: !!u.isAdmin,
          isActive: u.isActive !== false,
          createdAt: u.createdAt,
          orders: s.orders || 0,
          spent: Math.round(s.spent || 0),
          lastOrderAt: s.lastOrderAt || null,
        };
      })
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/** Promote / demote, activate / deactivate. The signed-in admin cannot lock themselves out. */
export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid account id' });

    const target = await User.findById(id);
    if (!target) return res.status(404).json({ message: 'Account not found' });

    const isSelf = String(target._id) === String(req.user._id);
    const { isAdmin, isActive, name } = req.body;

    if (name !== undefined) {
      const trimmed = String(name).trim();
      if (!trimmed) return res.status(400).json({ message: 'Name cannot be empty' });
      target.name = trimmed;
    }

    if (isAdmin !== undefined) {
      const next = !!isAdmin;
      if (next === false && target.isAdmin) {
        if (isSelf) {
          return res.status(400).json({ message: 'You cannot remove your own admin access' });
        }
        const remaining = await User.countDocuments({ isAdmin: true, _id: { $ne: target._id } });
        if (remaining === 0) {
          return res.status(400).json({ message: 'At least one admin account must remain' });
        }
      }
      if (next && target.isActive === false) {
        return res.status(400).json({ message: 'Reactivate the account before making it an admin' });
      }
      target.isAdmin = next;
    }

    if (isActive !== undefined) {
      const next = !!isActive;
      if (!next) {
        if (isSelf) return res.status(400).json({ message: 'You cannot deactivate your own account' });
        if (target.isAdmin) {
          const remaining = await User.countDocuments({ isAdmin: true, isActive: { $ne: false }, _id: { $ne: target._id } });
          if (remaining === 0) return res.status(400).json({ message: 'At least one active admin must remain' });
        }
      }
      target.isActive = next;
    }

    await target.save();

    // Let the account know when its access changes — by email, because they can
    // no longer sign in to read an in-app notification.
    if (isActive === false) {
      await Notification.create({
        user: target._id,
        title: 'Your account was deactivated',
        message: 'An administrator deactivated this account. You can no longer sign in or place orders.',
        type: 'account',
        link: '/',
      });
      const mail = accountDeactivatedEmail(target);
      sendEmail({ to: target.email, ...mail }).catch((err) =>
        console.error('[email] deactivation failed', err.message)
      );
    } else if (isActive === true) {
      await Notification.create({
        user: target._id,
        title: 'Your account was reactivated',
        message: 'Welcome back — you can sign in and shop again.',
        type: 'account',
        link: '/login',
      });
    }

    res.json(target.toSafe());
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

/**
 * Remove an account. Past orders are kept as sales records — they already carry
 * the buyer's name and email — but they are detached from the deleted login.
 */
export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid account id' });
    if (String(id) === String(req.user._id)) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    const target = await User.findById(id);
    if (!target) return res.status(404).json({ message: 'Account not found' });

    if (target.isAdmin) {
      const remaining = await User.countDocuments({ isAdmin: true, _id: { $ne: target._id } });
      if (remaining === 0) {
        return res.status(400).json({ message: 'At least one admin account must remain' });
      }
    }

    await Promise.all([
      Order.updateMany({ user: target._id }, { $unset: { user: '' } }),
      Notification.deleteMany({ user: target._id }),
      Review.deleteMany({ user: target._id }),
      target.deleteOne(),
    ]);

    res.json({ message: 'Account deleted', id: target._id, email: target.email });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
