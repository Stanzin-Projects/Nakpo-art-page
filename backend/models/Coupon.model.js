import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, default: '' },
    discountType: { type: String, enum: ['percent', 'fixed'], required: true },
    value: { type: Number, required: true },
    minSubtotal: { type: Number, default: 0 },
    maxDiscount: Number,
    active: { type: Boolean, default: true },
    expiresAt: Date,
    timesUsed: { type: Number, default: 0 },
    usageLimit: Number,
  },
  { timestamps: true }
);

export default mongoose.model('Coupon', couponSchema);
