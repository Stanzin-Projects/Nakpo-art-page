import Order from '../models/Order.model.js';
import Notification from '../models/Notification.model.js';

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
      user: req.user ? req.user._id : undefined,
      items: req.body.items || [],
      total: req.body.total,
      subtotal: req.body.subtotal,
      shipping: req.body.shipping,
      tax: req.body.tax,
      discount: req.body.discount || 0,
      couponCode: req.body.couponCode || '',
      customer: req.body.customer || {},
      shippingInfo: {
        ...(req.body.shippingInfo || {}),
        trackingNumber,
        estimatedDelivery,
      },
      timeline: req.body.timeline?.length ? req.body.timeline : defaultTimeline(),
    });

    if (req.user) {
      await Notification.create({
        user: req.user._id,
        title: `Order ${orderNumber} placed 🎨`,
        message: `Your order of $${order.total.toFixed(2)} is being prepared. Track it anytime.`,
        type: 'order',
        link: `/account?tab=orders&order=${orderNumber}`,
      });
    }

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

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const requestReturn = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.returnRequest) {
      return res.status(400).json({ message: 'A return request already exists for this order' });
    }
    const reason = String(req.body.reason || '').trim();
    if (!reason) return res.status(400).json({ message: 'Please provide a reason for the return' });

    order.returnRequest = {
      reason,
      status: 'requested',
      requestedAt: new Date().toISOString(),
    };
    await order.save();

    await Notification.create({
      user: req.user._id,
      title: `Return requested for ${order.orderNumber}`,
      message: `We received your return request: "${reason.slice(0, 120)}". We'll review it shortly.`,
      type: 'order',
      link: `/account?tab=orders&order=${order.orderNumber}`,
    });

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
