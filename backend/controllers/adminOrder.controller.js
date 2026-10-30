import Order from '../models/Order.model.js';
import Notification from '../models/Notification.model.js';
import mongoose from 'mongoose';

// The five stages an order moves through. 'processing' means it is being prepared.
const STEPS = [
  { key: 'placed', label: 'Order Placed', description: 'Your order has been received', at: 0 },
  { key: 'paid', label: 'Payment Confirmed', description: 'Payment processed', at: 0 },
  { key: 'preparing', label: 'Preparing for Shipment', description: 'Your artwork is being packaged', at: 1 },
  { key: 'shipped', label: 'Shipped', description: 'Your order is on its way', at: 2 },
  { key: 'delivered', label: 'Delivered', description: 'Delivered', at: 3 },
];

// How many of the five stages are complete for each order status.
const STATUS_PROGRESS = { processing: 1, shipped: 3, delivered: 4, cancelled: 1 };

function buildTimeline(existing = [], status, stamp) {
  const progress = STATUS_PROGRESS[status] ?? 1;
  const timeline = STEPS.map((step, i) => {
    const previous = existing.find((t) => t.status === step.label);
    const completed = i <= progress;
    const date = completed ? (previous?.completed ? previous.date : stamp) : '';
    return { status: step.label, date, description: step.description, completed };
  });
  if (status === 'cancelled') {
    const already = existing.find((t) => t.status === 'Cancelled');
    timeline.push({
      status: 'Cancelled',
      date: already?.date || stamp,
      description: 'This order was cancelled',
      completed: true,
    });
  }
  return timeline;
}

/** Every order, newest first, with optional status / text filters. Admin only. */
export async function listOrders(req, res) {
  try {
    const { status, q } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (q) {
      const rx = new RegExp(String(q).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { orderNumber: rx },
        { 'customer.email': rx },
        { 'customer.firstName': rx },
        { 'customer.lastName': rx },
      ];
    }
    const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(300);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/** Headline sales numbers for the admin dashboard. */
export async function getSalesStats(req, res) {
  try {
    const [byStatus, totals, monthly, topItems, recent] = await Promise.all([
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        {
          $group: {
            _id: null,
            revenue: { $sum: '$total' },
            orders: { $sum: 1 },
            units: { $sum: { $sum: '$items.quantity' } },
            average: { $avg: '$total' },
          },
        },
      ]),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            revenue: { $sum: '$total' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: -1 } },
        { $limit: 6 },
      ]),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.title',
            units: { $sum: '$items.quantity' },
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 5 },
      ]),
      Order.countDocuments({ createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
    ]);

    const statusCounts = byStatus.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {});
    const t = totals[0] || { revenue: 0, orders: 0, units: 0, average: 0 };

    res.json({
      revenue: Math.round(t.revenue || 0),
      orders: t.orders || 0,
      units: t.units || 0,
      averageOrder: Math.round(t.average || 0),
      last30Days: recent,
      statusCounts,
      totalOrders: Object.values(statusCounts).reduce((a, b) => a + b, 0),
      returns: await Order.countDocuments({ returnRequest: { $exists: true } }),
      monthly: monthly.map((m) => ({ month: m._id, revenue: Math.round(m.revenue), orders: m.orders })),
      topItems: topItems.map((i) => ({ title: i._id, units: i.units, revenue: Math.round(i.revenue) })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/** Update status / shipping / return state, keep the customer's timeline and inbox in sync. */
export async function updateOrder(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid order id' });
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const { status, trackingNumber, estimatedDelivery, returnStatus } = req.body;
    const stamp = new Date().toISOString();

    if (status && status !== order.status) {
      const allowed = ['processing', 'shipped', 'delivered', 'cancelled'];
      if (!allowed.includes(status)) return res.status(400).json({ message: 'Unknown status' });
      order.status = status;
      order.timeline = buildTimeline(order.timeline, status, stamp);

      if (order.user) {
        await Notification.create({
          user: order.user,
          title: `Order ${order.orderNumber} is now ${status}`,
          message:
            status === 'shipped'
              ? 'Your artwork has left the studio and is on its way.'
              : status === 'delivered'
                ? 'Your artwork has been delivered. We hope it found the right wall.'
                : status === 'cancelled'
                  ? 'Your order was cancelled. Any payment will be refunded.'
                  : 'Your order is being prepared in the studio.',
          type: 'order',
          link: `/account?tab=orders&order=${order.orderNumber}`,
        });
      }
    }

    if (trackingNumber !== undefined) order.shippingInfo.trackingNumber = trackingNumber;
    if (estimatedDelivery !== undefined) order.shippingInfo.estimatedDelivery = estimatedDelivery;

    if (returnStatus !== undefined) {
      if (!['requested', 'approved', 'rejected', 'refunded'].includes(returnStatus)) {
        return res.status(400).json({ message: 'Unknown return status' });
      }
      order.returnRequest = {
        ...(order.returnRequest?.reason ? { reason: order.returnRequest.reason } : {}),
        status: returnStatus,
        requestedAt: order.returnRequest?.requestedAt || stamp,
        resolvedAt: returnStatus === 'requested' ? undefined : stamp,
      };
      if (order.user) {
        await Notification.create({
          user: order.user,
          title: `Return ${returnStatus} for ${order.orderNumber}`,
          message:
            returnStatus === 'approved'
              ? 'Your return was approved — we will arrange collection.'
              : returnStatus === 'refunded'
                ? 'Your refund has been processed.'
                : 'Your return request was reviewed.',
          type: 'order',
          link: `/account?tab=orders&order=${order.orderNumber}`,
        });
      }
    }

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

/** Buyers with their lifetime order count and spend. Admin only. */
export async function listCustomers(req, res) {
  try {
    const customers = await Order.aggregate([
      { $match: { 'customer.email': { $nin: [null, ''] } } },
      {
        $group: {
          _id: { $toLower: '$customer.email' },
          name: { $last: { $concat: [{ $ifNull: ['$customer.firstName', ''] }, ' ', { $ifNull: ['$customer.lastName', ''] }] } },
          orders: { $sum: 1 },
          spent: { $sum: '$total' },
          lastOrderAt: { $max: '$createdAt' },
          firstOrderAt: { $min: '$createdAt' },
          registered: { $max: { $cond: [{ $ifNull: ['$user', false] }, true, false] } },
        },
      },
      { $sort: { spent: -1 } },
      { $limit: 200 },
    ]);
    res.json(
      customers.map((c) => ({
        email: c._id,
        name: (c.name || '').trim(),
        orders: c.orders,
        spent: Math.round(c.spent || 0),
        lastOrderAt: c.lastOrderAt,
        firstOrderAt: c.firstOrderAt,
        registered: !!c.registered,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
