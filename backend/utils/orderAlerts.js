import User from '../models/User.model.js';
import { sendEmail } from './mailer.js';
import { broadcast, newOrderEvent } from './orderEvents.js';
import { newOrderEmail } from '../emails/templates.js';

/**
 * Alert every admin that an order came in: pushed live to any open dashboard
 * and emailed as a copy. Never throws — a failed alert must not fail checkout.
 */
export async function alertAdminsOfNewOrder(order) {
  try {
    const payload = newOrderEvent(order);
    broadcast('order', payload);

    const admins = await User.find({ isAdmin: true, isActive: { $ne: false } }).select('email name');
    if (admins.length === 0) return;

    const mail = newOrderEmail(order, payload);
    for (const admin of admins) {
      sendEmail({ to: admin.email, ...mail }).catch((err) =>
        console.error('[email] order alert failed', err.message)
      );
    }
  } catch (err) {
    console.error('[alert] new order alert failed', err.message);
  }
}
