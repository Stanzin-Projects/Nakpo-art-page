import express from 'express';
import User from '../models/User.model.js';
import Notification from '../models/Notification.model.js';
import { requireAuth } from '../middleware/auth.js';
import {
  hashPassword,
  verifyPassword,
  createToken,
  createResetToken,
} from '../utils/auth.js';
import { sendEmail } from '../utils/mailer.js';
import { welcomeEmail } from '../emails/templates.js';

const router = express.Router();

// Buyer accounts: anyone can open one. The admin account is seeded separately
// (backend/seed.js) and is the only account that can reach /api/admin.
router.post('/register', async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').toLowerCase().trim();
    const password = String(req.body.password || '');

    if (name.length < 2) return res.status(400).json({ message: 'Please enter your name' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const { salt, hash } = hashPassword(password);
    const user = await User.create({ name, email, salt, hash, isAdmin: false });

    await Notification.create({
      user: user._id,
      title: 'Welcome to ARTBYLOPSANG',
      message: 'Your account is ready — your orders, tracking and reviews live here.',
      type: 'account',
      link: '/account?tab=orders',
    });

    // Fire-and-forget: a slow or missing email service must never block sign-up.
    const mail = welcomeEmail(user);
    sendEmail({ to: user.email, ...mail }).catch((err) =>
      console.error('[email] welcome failed', err.message)
    );

    res.status(201).json({ token: createToken(user._id), user: user.toSafe() });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: String(email || '').toLowerCase() });
    if (!user || !verifyPassword(String(password || ''), user.salt, user.hash)) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (user.isActive === false) {
      return res.status(403).json({ message: 'This account has been deactivated. Contact the studio if you think this is a mistake.' });
    }
    res.json({ token: createToken(user._id), user: user.toSafe() });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Demo flow: no email service, so the reset link/token is returned in the response.
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: String(email || '').toLowerCase() });
    if (!user) return res.status(404).json({ message: 'No account found with that email' });
    const resetToken = createResetToken();
    user.resetToken = resetToken;
    user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();
    res.json({
      message: 'Password reset link generated',
      resetToken, // demo: shown to the user because there is no email service configured
      resetUrl: `/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, token, password } = req.body;
    const user = await User.findOne({ email: String(email || '').toLowerCase() });
    if (!user || !user.resetToken || user.resetToken !== token) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      return res.status(400).json({ message: 'Reset token has expired. Request a new one.' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const { salt, hash } = hashPassword(String(password));
    user.salt = salt;
    user.hash = hash;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();
    res.json({ message: 'Password updated. You can now sign in.' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/me', requireAuth, (req, res) => {
  res.json(req.user.toSafe());
});

router.put('/me', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const { name, email, currentPassword, newPassword } = req.body;
    if (name) user.name = String(name).trim();
    if (email) {
      const clash = await User.findOne({ email: String(email).toLowerCase(), _id: { $ne: user._id } });
      if (clash) return res.status(409).json({ message: 'Email already in use' });
      user.email = String(email).toLowerCase();
    }
    if (currentPassword || newPassword) {
      if (!verifyPassword(String(currentPassword || ''), user.salt, user.hash)) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      if (String(newPassword).length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters' });
      }
      const { salt, hash } = hashPassword(String(newPassword));
      user.salt = salt;
      user.hash = hash;
    }
    await user.save();
    res.json(user.toSafe());
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
