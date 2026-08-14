import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  id: String,
  title: String,
  image: String,
  price: Number,
  quantity: Number,
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['processing', 'shipped', 'delivered', 'cancelled'],
      default: 'processing',
    },
    items: [orderItemSchema],
    total: { type: Number, required: true },
    subtotal: Number,
    shipping: Number,
    tax: Number,
    discount: { type: Number, default: 0 },
    couponCode: String,
    customer: {
      email: String,
      firstName: String,
      lastName: String,
      address: String,
      city: String,
      zipCode: String,
      country: String,
    },
    shippingInfo: {
      address: String,
      method: { type: String, default: 'Standard Shipping' },
      trackingNumber: String,
      estimatedDelivery: String,
    },
    returnRequest: {
      type: new mongoose.Schema(
        {
          reason: String,
          status: { type: String, enum: ['requested', 'approved', 'rejected', 'refunded'] },
          requestedAt: String,
          resolvedAt: String,
        },
        { _id: false }
      ),
      default: undefined,
    },
    timeline: [
      {
        status: String,
        date: String,
        description: String,
        completed: Boolean,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);
