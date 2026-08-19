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

const router = express.Router();

// Registration is closed: guests browse and order without an account, and
// sign-in is reserved for the admin (seeded by backend/seed.js).
router.post('/register', async (req, res) => {
  res.status(403).json({ message: 'Registration is closed — guests can browse and order directly. Only the admin can sign in.' });
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: String(email || '').toLowerCase() });
    if (!user || !verifyPassword(String(password || ''), user.salt, user.hash)) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (!user.isAdmin) {
      return res.status(403).json({ message: 'Only the admin can sign in. Guests can browse and order directly without an account.' });
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
