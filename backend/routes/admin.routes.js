import express from 'express';
import {
  listOrders,
  getSalesStats,
  updateOrder,
  listCustomers,
} from '../controllers/adminOrder.controller.js';
import { listUsers, updateUser, deleteUser } from '../controllers/adminUser.controller.js';
import { applySale, clearSale } from '../controllers/adminSale.controller.js';
import { requireAdmin } from '../middleware/auth.js';
import { verifyToken } from '../utils/auth.js';
import { subscribe } from '../utils/orderEvents.js';
import User from '../models/User.model.js';

const router = express.Router();

/**
 * Live order alerts for the admin dashboard (Server-Sent Events).
 *
 * EventSource cannot send an Authorization header, so the token arrives as a
 * query parameter and is verified here before anything is streamed.
 */
router.get('/events', async (req, res) => {
  const userId = verifyToken(String(req.query.token || ''));
  if (!userId) return res.status(401).json({ message: 'Authentication required' });

  const user = await User.findById(userId).select('isAdmin isActive');
  if (!user || !user.isAdmin || user.isActive === false) {
    return res.status(403).json({ message: 'Admin access required' });
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.write('retry: 5000\n\n');
  res.write('event: ready\ndata: {"ok":true}\n\n');

  const unsubscribe = subscribe(res);
  // Comment frames keep proxies and Windows TCP from dropping an idle stream.
  const heartbeat = setInterval(() => {
    try {
      res.write(': ping\n\n');
    } catch {
      /* closed */
    }
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    unsubscribe();
  });
});

// Everything below /api/admin is restricted to the admin account.
router.use(requireAdmin);

router.get('/orders', listOrders);
router.get('/orders/stats', getSalesStats);
router.patch('/orders/:id', updateOrder);
router.get('/customers', listCustomers);

// Store-wide sales (eg. "Diwali Sale — 40% off").
router.post('/sale/apply', applySale);
router.post('/sale/clear', clearSale);

// Buyer accounts: promote/demote, deactivate/reactivate, delete.
router.get('/users', listUsers);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

export default router;
