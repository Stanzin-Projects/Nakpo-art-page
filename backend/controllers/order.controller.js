import Order from '../models/Order.model.js';

function defaultTimeline() {
  const now = new Date().toISOString();
  return [
    { status: 'Order Placed', date: now, description: 'Your order has been received', completed: true },
    { status: 'Payment Confirmed', date: now, description: 'Payment processed', completed: true },
    { status: 'Preparing for Shipment', date: '', description: 'Your artwork is being packaged', completed: false },
    { status: 'Shipped', date: '', description: 'Your order is on its way', completed: false },
    { status: 'Delivered', date: '', description: 'Delivered', completed: false },
  ];
}

export const createOrder = async (req, res) => {
  try {
    const orderNumber = `ART-${Date.now().toString().slice(-6)}`;
    const trackingNumber = `TRK${Date.now().toString().slice(-8)}`;
    const estimatedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const order = await Order.create({
      orderNumber,
      status: 'processing',
      items: req.body.items || [],
      total: req.body.total,
      subtotal: req.body.subtotal,
      shipping: req.body.shipping,
      tax: req.body.tax,
      customer: req.body.customer || {},
      shippingInfo: {
        ...(req.body.shippingInfo || {}),
        trackingNumber,
        estimatedDelivery,
      },
      timeline: req.body.timeline?.length ? req.body.timeline : defaultTimeline(),
    });
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getOrdersByQuery = async (req, res) => {
  try {
    const { orderNumber, email } = req.query;
    const filter = {};
    if (orderNumber) filter.orderNumber = new RegExp(orderNumber, 'i');
    if (email) filter['customer.email'] = new RegExp(email, 'i');
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
