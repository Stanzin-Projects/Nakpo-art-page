import express from 'express';
import Coupon from '../models/Coupon.model.js';

const router = express.Router();

router.post('/validate', async (req, res) => {
  try {
    const code = String(req.body.code || '').trim().toUpperCase();
    const subtotal = Number(req.body.subtotal) || 0;
    if (!code) return res.status(400).json({ message: 'Enter a coupon code' });

    const coupon = await Coupon.findOne({ code });
    if (!coupon || !coupon.active) {
      return res.status(404).json({ message: 'Invalid coupon code' });
    }
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return res.status(400).json({ message: 'This coupon has expired' });
    }
    if (coupon.usageLimit && coupon.timesUsed >= coupon.usageLimit) {
      return res.status(400).json({ message: 'This coupon has reached its usage limit' });
    }
    if (subtotal < coupon.minSubtotal) {
      return res
        .status(400)
        .json({ message: `This coupon requires a subtotal of at least $${coupon.minSubtotal}` });
    }

    let discount = coupon.discountType === 'percent' ? (subtotal * coupon.value) / 100 : coupon.value;
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    discount = Math.round(discount * 100) / 100;

    res.json({
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      value: coupon.value,
      discount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
