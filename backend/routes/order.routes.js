import express from 'express';
import {
  createOrder,
  getOrdersByQuery,
  getMyOrders,
  requestReturn,
} from '../controllers/order.controller.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', optionalAuth, createOrder);
router.get('/', getOrdersByQuery);
router.get('/mine', requireAuth, getMyOrders);
router.post('/:id/return', requireAuth, requestReturn);

export default router;
