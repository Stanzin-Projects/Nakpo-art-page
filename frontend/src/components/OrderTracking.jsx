import { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, Clock, MapPin, Search } from 'lucide-react';
import { getOrders } from '../api/order.api';

export function OrderTracking({ isOpen, onClose, initialOrder }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // preselect an order when one is passed in (e.g. from order history)
  useEffect(() => {
    if (initialOrder) {
      setSelectedOrder(initialOrder);
      setSearchResults([]);
      setError('');
    }
  }, [initialOrder, isOpen]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter an order number or email');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const isEmail = searchQuery.includes('@');
      const params = isEmail ? { email: searchQuery } : { orderNumber: searchQuery };
      const res = await getOrders(params);
      setSearchResults(res.data || []);
      if (!res.data?.length) setError('No orders found.');
    } catch (err) {
      setSearchResults([]);
      setError(err.response?.data?.message || 'Search failed.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getStatusIcon = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('placed') || s.includes('payment') || s.includes('processing')) return <Clock className="h-4 w-4" />;
    if (s.includes('preparing')) return <Package className="h-4 w-4" />;
    if (s.includes('shipped') || s.includes('delivery')) return <Truck className="h-4 w-4" />;
    if (s.includes('delivered')) return <CheckCircle className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };

  const getStatusColor = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('processing')) return 'bg-yellow-100 text-yellow-800';
    if (s.includes('shipped')) return 'bg-blue-100 text-blue-800';
    if (s.includes('delivered')) return 'bg-green-100 text-green-800';
    if (s.includes('cancelled')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const order = selectedOrder;
  const shipping = order?.shippingInfo || order?.shipping || {};
  const timeline = order?.timeline || [];

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} aria-hidden />
      <div className="fixed inset-4 md:inset-8 z-50 overflow-auto bg-background rounded-lg shadow-2xl max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-medium flex items-center gap-2">
            <Package className="h-5 w-5" />
            Track Your Order
          </h2>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            Close
          </button>
        </div>

        {!selectedOrder ? (
          <div className="space-y-6">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Order number (e.g. ART-123456) or email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 h-10 px-4 rounded-md border border-border bg-background text-sm"
              />
              <button
                type="button"
                onClick={handleSearch}
                disabled={loading}
                className="h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2 disabled:opacity-50"
              >
                <Search className="h-4 w-4" />
                Search
              </button>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {searchResults.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-medium">Your Orders ({searchResults.length})</h3>
                {searchResults.map((o) => (
                  <button
                    key={o._id || o.orderNumber}
                    type="button"
                    onClick={() => setSelectedOrder(o)}
                    className="w-full text-left border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{o.orderNumber}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(o.status)}`}>
                        {o.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : ''} · ${o.total}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <button
              type="button"
              onClick={() => setSelectedOrder(null)}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back to Search
            </button>
            <div className="border border-border rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-medium">{order.orderNumber}</h2>
                  <p className="text-muted-foreground text-sm">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded text-sm ${getStatusColor(order.status)}`}>{order.status}</span>
              </div>
              {shipping.trackingNumber && (
                <div className="bg-muted/30 p-4 rounded-lg mb-4">
                  <p className="font-medium text-sm">Tracking Number</p>
                  <p className="font-mono text-sm">{shipping.trackingNumber}</p>
                  {shipping.estimatedDelivery && (
                    <p className="text-muted-foreground text-sm mt-1">
                      Est. delivery: {shipping.estimatedDelivery}
                    </p>
                  )}
                </div>
              )}
            </div>
            {timeline.length > 0 && (
              <div className="border border-border rounded-lg p-6">
                <h3 className="font-medium mb-4">Order Timeline</h3>
                <div className="space-y-4">
                  {timeline.map((event, i) => (
                    <div key={i} className="flex gap-4">
                      <div
                        className={`mt-1 p-2 rounded-full ${
                          event.completed ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {getStatusIcon(event.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <h4 className={`font-medium text-sm ${event.completed ? '' : 'text-muted-foreground'}`}>
                            {event.status}
                          </h4>
                          <span className="text-xs text-muted-foreground">{event.date}</span>
                        </div>
                        <p className={`text-sm ${event.completed ? '' : 'text-muted-foreground'}`}>{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="border border-border rounded-lg p-6">
              <h3 className="font-medium mb-4">Order Items</h3>
              <div className="space-y-4">
                {(order.items || []).map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-16 h-16 rounded object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.title}</h4>
                      <p className="text-muted-foreground text-sm">Qty: {item.quantity}</p>
                      <p className="font-medium text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-medium text-lg mt-4 pt-4 border-t border-border">
                <span>Total</span>
                <span>${order.total}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
