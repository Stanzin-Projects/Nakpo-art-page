/**
 * A tiny Server-Sent Events hub for admin alerts.
 *
 * Every admin panel that is open holds one subscription; when an order is
 * placed the event is pushed to all of them, so the dashboard updates without
 * polling or a refresh.
 */

const clients = new Set();

/** Register an SSE response. Returns the unsubscribe function. */
export function subscribe(res) {
  clients.add(res);
  return () => clients.delete(res);
}

export function connectionCount() {
  return clients.size;
}

function write(res, chunk) {
  try {
    res.write(chunk);
  } catch {
    clients.delete(res);
  }
}

/** Push one named event to every connected admin. */
export function broadcast(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of clients) write(res, payload);
}

/** Shape an order into the small payload the admin dashboard needs. */
export function newOrderEvent(order) {
  const customer = order.customer || {};
  const name = [customer.firstName, customer.lastName].filter(Boolean).join(' ').trim();
  return {
    id: String(order._id),
    orderNumber: order.orderNumber,
    total: order.total,
    items: (order.items || []).reduce((sum, i) => sum + (i.quantity || 1), 0),
    customer: name || customer.email || 'Guest',
    email: customer.email || '',
    createdAt: order.createdAt || new Date().toISOString(),
  };
}
