import express from 'express';
import { createOrder, getOrdersByQuery } from '../controllers/order.controller.js';

const router = express.Router();

router.post('/', createOrder);
router.get('/', getOrdersByQuery);

export default router;
