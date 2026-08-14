import User from '../models/User.model.js';
import { verifyToken } from '../utils/auth.js';

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    const userId = token ? verifyToken(token) : null;
    if (!userId) return res.status(401).json({ message: 'Authentication required' });
    const user = await User.findById(userId);
    if (!user) return res.status(401).json({ message: 'User not found' });
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Like requireAuth, but guests are allowed through too (req.user stays undefined).
export async function optionalAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    const userId = token ? verifyToken(token) : null;
    if (userId) {
      const user = await User.findById(userId);
      if (user) req.user = user;
    }
    next();
  } catch (error) {
    next();
  }
}
