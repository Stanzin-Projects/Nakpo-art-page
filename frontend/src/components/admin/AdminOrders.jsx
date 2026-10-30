import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Loader2,
  Search,
  Package,
  TrendingUp,
  ShoppingBag,
  ChevronDown,
  Save,
  Truck,
  RotateCcw,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { getAdminOrders, getSalesStats, updateAdminOrder } from '../../api/admin.api';
import { useToast } from '../../context/ToastContext';

const STATUS_FILTERS = ['all', 'processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_OPTIONS = ['processing', 'shipped', 'delivered', 'cancelled'];

const statusCls = {
  processing: 'bg-yellow-100 text-yellow-800',
  shipped: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

function money(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN');
}

function buyerName(o) {
  const name = [o.customer?.firstName, o.customer?.lastName].filter(Boolean).join(' ').trim();
  return name || o.customer?.email || 'Guest';
}

export function AdminOrders({ refreshKey = 0 }) {
  const { push } = useToast();

  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [draft, setDraft] = useState({});
  const [savingId, setSavingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (status !== 'all') params.status = status;
      if (query.trim()) params.q = query.trim();
      const [ordersRes, statsRes] = await Promise.all([getAdminOrders(params), getSalesStats()]);
      setOrders(ordersRes.data || []);
      setStats(statsRes.data || null);
    } catch (err) {
      push(err.response?.data?.message || 'Could not load orders', 'error');
    } finally {
      setLoading(false);
    }
  }, [status, query, push]);

  // Debounce the search box so typing does not hammer the API, and reload
  // immediately when a live order alert bumps refreshKey.
  useEffect(() => {
    const id = setTimeout(load, 250);
    return () => clearTimeout(id);
  }, [load, refreshKey]);

  const openOrder = (order) => {
    const id = order._id;
    if (expanded === id) {
      setExpanded(null);
      return;
    }
    setExpanded(id);
    setDraft((d) => ({
      ...d,
      [id]: {
        status: order.status,
        trackingNumber: order.shippingInfo?.trackingNumber || '',
        estimatedDelivery: order.shippingInfo?.estimatedDelivery || '',
      },
    }));
  };

  const setField = (id, key, value) => setDraft((d) => ({ ...d, [id]: { ...d[id], [key]: value } }));

  const save = async (order) => {
    const id = order._id;
    setSavingId(id);
    try {
      await updateAdminOrder(id, draft[id]);
      push(`${order.orderNumber} updated`);
      await load();
    } catch (err) {
      push(err.response?.data?.message || 'Update failed', 'error');
    } finally {
      setSavingId(null);
    }
  };

  const setReturn = async (order, returnStatus) => {
    setSavingId(order._id);
    try {
      await updateAdminOrder(order._id, { returnStatus });
      push(`Return ${returnStatus}`);
      await load();
    } catch (err) {
      push(err.response?.data?.message || 'Update failed', 'error');
    } finally {
      setSavingId(null);
    }
  };

  const topMonth = useMemo(() => Math.max(1, ...(stats?.monthly || []).map((m) => m.revenue)), [stats]);

  if (loading && !stats) {
    return <div className="text-center py-12 text-muted-foreground">Loading sales…</div>;
  }

  return (
    <div className="space-y-8">
      {/* ---- headline numbers ---- */}
      {stats && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Kpi label="Revenue" value={money(stats.revenue)} icon={TrendingUp} note={`${stats.orders} paid orders`} />
            <Kpi label="Orders" value={stats.totalOrders} icon={Package} note={`${stats.last30Days} in last 30 days`} />
            <Kpi label="Pieces sold" value={stats.units} icon={ShoppingBag} note={`Avg ${money(stats.averageOrder)}`} />
            <Kpi label="Returns" value={stats.returns} icon={RotateCcw} note="requests received" />
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            <div className="border border-border rounded-lg p-5">
              <h3 className="font-medium mb-4">By status</h3>
              <div className="space-y-2 text-sm">
                {STATUS_OPTIONS.map((s) => (
                  <div key={s} className="flex items-center justify-between">
                    <span className="capitalize text-muted-foreground">{s}</span>
                    <span className="font-medium">{stats.statusCounts?.[s] || 0}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-border rounded-lg p-5">
              <h3 className="font-medium mb-4">Recent months</h3>
              {stats.monthly?.length ? (
                <div className="space-y-3">
                  {stats.monthly.map((m) => (
                    <div key={m.month}>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>{m.month}</span>
                        <span>{money(m.revenue)}</span>
                      </div>
                      <div className="h-2 rounded bg-muted overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${Math.round((m.revenue / topMonth) * 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No sales yet.</p>
              )}
            </div>

            <div className="border border-border rounded-lg p-5">
              <h3 className="font-medium mb-4">Best sellers</h3>
              {stats.topItems?.length ? (
                <div className="space-y-2 text-sm">
                  {stats.topItems.map((i) => (
                    <div key={i.title} className="flex items-center justify-between gap-3">
                      <span className="truncate">{i.title}</span>
                      <span className="text-muted-foreground whitespace-nowrap">
                        {i.units} · {money(i.revenue)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No sales yet.</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* ---- filters ---- */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`h-9 px-4 rounded-md text-sm font-medium capitalize ${
                status === s ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-muted'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Order number, name or email"
            className="w-full h-9 pl-9 pr-3 rounded-md border border-border bg-background text-sm"
          />
        </div>
      </div>

      {/* ---- order list ---- */}
      {orders.length === 0 ? (
        <p className="text-muted-foreground text-sm border border-dashed border-border rounded-lg p-8 text-center">
          {loading ? 'Loading orders…' : 'No orders match this view.'}
        </p>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => {
            const id = o._id;
            const isOpen = expanded === id;
            const d = draft[id] || { status: o.status, trackingNumber: '', estimatedDelivery: '' };
            return (
              <div key={id} className="border border-border rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => openOrder(o)}
                  className="w-full flex flex-wrap items-center gap-3 p-4 text-left hover:bg-muted/40"
                >
                  <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  <span className="font-medium">{o.orderNumber}</span>
                  <span className={`text-xs px-2 py-0.5 rounded capitalize ${statusCls[o.status] || 'bg-muted'}`}>{o.status}</span>
                  {o.returnRequest && (
                    <span className="text-xs px-2 py-0.5 rounded bg-orange-100 text-orange-700">return: {o.returnRequest.status}</span>
                  )}
                  <span className="text-sm text-muted-foreground flex-1 min-w-[8rem] truncate">{buyerName(o)}</span>
                  <span className="text-xs text-muted-foreground">
                    {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : ''}
                  </span>
                  <span className="font-medium">{money(o.total)}</span>
                </button>

                {isOpen && (
                  <div className="border-t border-border p-4 space-y-4 bg-muted/20">
                    <div className="grid lg:grid-cols-2 gap-4">
                      {/* items */}
                      <div className="border border-border rounded-lg p-4 bg-background">
                        <h4 className="font-medium text-sm mb-3">Items</h4>
                        <div className="space-y-3">
                          {(o.items || []).map((item, i) => (
                            <div key={i} className="flex items-center gap-3 text-sm">
                              {item.image && <img src={item.image} alt="" className="w-10 h-10 rounded object-cover" />}
                              <span className="flex-1">
                                {item.title}
                                <span className="text-muted-foreground"> × {item.quantity}</span>
                              </span>
                              <span>{money((item.price || 0) * (item.quantity || 1))}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between text-sm font-medium mt-3 pt-3 border-t border-border">
                          <span>Total</span>
                          <span>{money(o.total)}</span>
                        </div>
                      </div>

                      {/* customer */}
                      <div className="border border-border rounded-lg p-4 bg-background">
                        <h4 className="font-medium text-sm mb-3">Customer</h4>
                        <p className="text-sm">{buyerName(o)}</p>
                        <p className="text-sm text-muted-foreground">{o.customer?.email || '—'}</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          {[o.customer?.address, o.customer?.city, o.customer?.zipCode, o.customer?.country]
                            .filter(Boolean)
                            .join(', ') || 'No address on file'}
                        </p>
                        {o.user ? (
                          <p className="text-xs text-muted-foreground mt-2">Registered account</p>
                        ) : (
                          <p className="text-xs text-muted-foreground mt-2">Guest checkout</p>
                        )}
                      </div>
                    </div>

                    {/* controls */}
                    <div className="grid sm:grid-cols-3 gap-3">
                      <label className="block">
                        <span className="block text-xs text-muted-foreground mb-1">Status</span>
                        <select
                          value={d.status}
                          onChange={(e) => setField(id, 'status', e.target.value)}
                          className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm capitalize"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="block">
                        <span className="block text-xs text-muted-foreground mb-1">Tracking number</span>
                        <input
                          value={d.trackingNumber}
                          onChange={(e) => setField(id, 'trackingNumber', e.target.value)}
                          className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm"
                          placeholder="TRK…"
                        />
                      </label>
                      <label className="block">
                        <span className="block text-xs text-muted-foreground mb-1">Estimated delivery</span>
                        <input
                          type="date"
                          value={d.estimatedDelivery || ''}
                          onChange={(e) => setField(id, 'estimatedDelivery', e.target.value)}
                          className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm"
                        />
                      </label>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => save(o)}
                        disabled={savingId === id}
                        className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
                      >
                        {savingId === id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save changes
                      </button>

                      {o.returnRequest && (
                        <>
                          <button
                            type="button"
                            onClick={() => setReturn(o, 'approved')}
                            disabled={savingId === id}
                            className="inline-flex items-center gap-1.5 h-10 px-3 rounded-md border border-border text-sm hover:bg-muted disabled:opacity-50"
                          >
                            <CheckCircle2 className="h-4 w-4" /> Approve return
                          </button>
                          <button
                            type="button"
                            onClick={() => setReturn(o, 'refunded')}
                            disabled={savingId === id}
                            className="inline-flex items-center gap-1.5 h-10 px-3 rounded-md border border-border text-sm hover:bg-muted disabled:opacity-50"
                          >
                            <Truck className="h-4 w-4" /> Mark refunded
                          </button>
                          <button
                            type="button"
                            onClick={() => setReturn(o, 'rejected')}
                            disabled={savingId === id}
                            className="inline-flex items-center gap-1.5 h-10 px-3 rounded-md border border-red-200 text-red-600 text-sm hover:bg-red-50 disabled:opacity-50"
                          >
                            <XCircle className="h-4 w-4" /> Reject
                          </button>
                          {o.returnRequest.reason && (
                            <p className="text-xs text-muted-foreground w-full">Reason: {o.returnRequest.reason}</p>
                          )}
                        </>
                      )}
                    </div>

                    {/* timeline */}
                    {!!(o.timeline || []).length && (
                      <div className="border border-border rounded-lg p-4 bg-background">
                        <h4 className="font-medium text-sm mb-3">Timeline</h4>
                        <div className="space-y-2">
                          {o.timeline.map((t, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              {t.completed ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                              ) : (
                                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                              )}
                              <span className={t.completed ? '' : 'text-muted-foreground'}>{t.status}</span>
                              <span className="text-xs text-muted-foreground ml-auto">
                                {t.date ? new Date(t.date).toLocaleDateString() : '—'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Kpi({ label, value, note, icon: Icon }) {
  return (
    <div className="border border-border rounded-lg p-4">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-xs uppercase tracking-wide">{label}</span>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-2xl font-medium mt-2">{value}</p>
      {note && <p className="text-xs text-muted-foreground mt-1">{note}</p>}
    </div>
  );
}
