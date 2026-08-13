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
