import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  MapPin,
  Package,
  Bell,
  Plus,
  Trash2,
  Truck,
  RotateCcw,
  LogOut,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { getMyOrders, requestReturn } from '../api/order.api';
import { getNotifications, markAllRead, markRead } from '../api/notification.api';
import { getOrders } from '../api/order.api';

const TABS = [
  { id: 'profile', label: 'Profile', icon: UserIcon },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

export default function AccountPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading, updateProfile, logout, saveAddress, removeAddress, favoriteIds } = useAuth();
  const { openTracking } = useCart();
  const { push } = useToast();

  const tab = searchParams.get('tab') || 'profile';
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // profile form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // address form
  const [addrForm, setAddrForm] = useState({ label: 'Home', line1: '', line2: '', city: '', state: '', zip: '', country: '', isDefault: false });
  const [editingAddr, setEditingAddr] = useState(null);

  // return reason
  const [returnOrder, setReturnOrder] = useState(null);
  const [returnReason, setReturnReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName(user.name || '');
    setEmail(user.email || '');
  }, [user]);

  useEffect(() => {
    if (!user || tab !== 'orders') return;
    getMyOrders()
      .then((res) => setOrders(res.data || []))
      .catch(() => setOrders([]));
  }, [user, tab]);

  useEffect(() => {
    if (!user || tab !== 'notifications') return;
    getNotifications()
      .then((res) => {
        setNotifications(res.data || []);
        setUnreadCount((res.data || []).filter((n) => !n.read).length);
      })
      .catch(() => setNotifications([]));
  }, [user, tab]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({ name, email, currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      push('Profile updated');
    } catch (err) {
      push(err.response?.data?.message || 'Update failed', 'error');
    }
  };

  const handleAddrSubmit = async (e) => {
    e.preventDefault();
    if (!addrForm.line1.trim()) {
      push('Address line 1 is required', 'error');
      return;
    }
    try {
      await saveAddress(addrForm, editingAddr?._id);
      setAddrForm({ label: 'Home', line1: '', line2: '', city: '', state: '', zip: '', country: '', isDefault: false });
      setEditingAddr(null);
      push('Address saved');
    } catch (err) {
      push(err.response?.data?.message || 'Could not save address', 'error');
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await requestReturn(returnOrder._id, returnReason);
      setReturnOrder(null);
      setReturnReason('');
      const res = await getMyOrders();
      setOrders(res.data || []);
      push('Return requested');
    } catch (err) {
      push(err.response?.data?.message || 'Could not request return', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  if (loading) {
    return <div className="min-h-[50vh] flex items-center justify-center text-muted-foreground">Loading…</div>;
  }

  if (!user) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-xl font-medium mb-2">Your Account</h1>
        <p className="text-muted-foreground text-sm mb-6">Sign in to view your profile, orders, and wishlist.</p>
        <div className="flex gap-3">
          <Link to="/login" className="inline-block h-10 px-6 rounded-md bg-primary text-primary-foreground text-sm font-medium leading-10">
            Sign In
          </Link>
          <Link to="/register" className="inline-block h-10 px-6 rounded-md border border-border text-sm font-medium leading-10">
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-medium">Hi, {user.name} 👋</h1>
          <p className="text-muted-foreground text-sm">{user.email}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            logout();
            navigate('/');
            push('Signed out', 'info');
          }}
          className="h-9 px-4 rounded-md border border-border text-sm font-medium inline-flex items-center gap-2 hover:bg-muted"
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSearchParams({ tab: t.id })}
            className={`whitespace-nowrap inline-flex items-center gap-2 h-10 px-4 rounded-md text-sm font-medium ${
              tab === t.id ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-muted'
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
            {t.id === 'notifications' && unreadCount > 0 && (
              <span className="rounded-full bg-red-600 text-white text-xs h-5 min-w-5 px-1 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* PROFILE */}
      {tab === 'profile' && (
        <form onSubmit={handleProfileSubmit} className="max-w-lg space-y-4 border border-border rounded-lg p-6">
          <h2 className="font-medium">Profile</h2>
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full h-10 px-4 rounded-md border border-border bg-background text-sm" />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-10 px-4 rounded-md border border-border bg-background text-sm" />
          </div>
          <div className="border-t border-border pt-4">
            <h3 className="font-medium mb-3">Change Password</h3>
            <div className="space-y-3">
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current password" className="w-full h-10 px-4 rounded-md border border-border bg-background text-sm" />
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password (min 6 characters)" className="w-full h-10 px-4 rounded-md border border-border bg-background text-sm" />
            </div>
          </div>
          <button type="submit" className="h-11 px-6 rounded-md bg-primary text-primary-foreground font-medium">
            Save Changes
          </button>
        </form>
      )}

      {/* ADDRESSES */}
      {tab === 'addresses' && (
        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <h2 className="font-medium mb-4">Saved Addresses</h2>
            {user.addresses?.length === 0 ? (
              <p className="text-muted-foreground text-sm border border-dashed border-border rounded-lg p-6 text-center">
                No saved addresses yet.
              </p>
            ) : (
              <div className="space-y-3">
                {user.addresses.map((a) => (
                  <div key={a._id} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm flex items-center gap-2">
                        {a.label}
                        {a.isDefault && (
                          <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 rounded px-1.5 py-0.5">
                            <Check className="h-3 w-3" /> Default
                          </span>
                        )}
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingAddr(a);
                            setAddrForm({ label: a.label, line1: a.line1, line2: a.line2 || '', city: a.city || '', state: a.state || '', zip: a.zip || '', country: a.country || '', isDefault: !!a.isDefault });
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="text-xs text-primary hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            await removeAddress(a._id);
                            push('Address removed', 'info');
                          }}
                          className="text-xs text-muted-foreground hover:text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {a.line1}{a.line2 ? `, ${a.line2}` : ''}, {a.city || ''} {a.state || ''} {a.zip || ''}, {a.country || ''}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="font-medium mb-4">{editingAddr ? 'Edit Address' : 'Add New Address'}</h2>
            <form onSubmit={handleAddrSubmit} className="space-y-3 border border-border rounded-lg p-4">
              <div className="grid grid-cols-2 gap-3">
                <input value={addrForm.label} onChange={(e) => setAddrForm({ ...addrForm, label: e.target.value })} placeholder="Label (e.g. Home)" className="h-10 px-4 rounded-md border border-border bg-background text-sm" />
                <input value={addrForm.line1} onChange={(e) => setAddrForm({ ...addrForm, line1: e.target.value })} placeholder="Address line 1 *" required className="h-10 px-4 rounded-md border border-border bg-background text-sm" />
              </div>
              <input value={addrForm.line2} onChange={(e) => setAddrForm({ ...addrForm, line2: e.target.value })} placeholder="Address line 2" className="w-full h-10 px-4 rounded-md border border-border bg-background text-sm" />
              <div className="grid grid-cols-3 gap-3">
                <input value={addrForm.city} onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })} placeholder="City" className="h-10 px-4 rounded-md border border-border bg-background text-sm" />
                <input value={addrForm.state} onChange={(e) => setAddrForm({ ...addrForm, state: e.target.value })} placeholder="State" className="h-10 px-4 rounded-md border border-border bg-background text-sm" />
                <input value={addrForm.zip} onChange={(e) => setAddrForm({ ...addrForm, zip: e.target.value })} placeholder="ZIP" className="h-10 px-4 rounded-md border border-border bg-background text-sm" />
              </div>
              <input value={addrForm.country} onChange={(e) => setAddrForm({ ...addrForm, country: e.target.value })} placeholder="Country" className="w-full h-10 px-4 rounded-md border border-border bg-background text-sm" />
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={addrForm.isDefault}
                  onChange={(e) => setAddrForm({ ...addrForm, isDefault: e.target.checked })}
                  className="h-4 w-4"
                />
                Set as default address
              </label>
              <div className="flex gap-3">
                <button type="submit" className="h-10 px-6 rounded-md bg-primary text-primary-foreground text-sm font-medium inline-flex items-center gap-1.5">
                  <Plus className="h-4 w-4" /> {editingAddr ? 'Update Address' : 'Save Address'}
                </button>
                {editingAddr && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingAddr(null);
                      setAddrForm({ label: 'Home', line1: '', line2: '', city: '', state: '', zip: '', country: '', isDefault: false });
                    }}
                    className="h-10 px-4 rounded-md border border-border text-sm"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ORDERS */}
      {tab === 'orders' && (
        <div>
          <h2 className="font-medium mb-4">Order History</h2>
          {orders.length === 0 ? (
            <p className="text-muted-foreground text-sm border border-dashed border-border rounded-lg p-6 text-center">
              No orders yet.{' '}
              <Link to="/" className="text-primary hover:underline">
                Browse the gallery
              </Link>
            </p>
          ) : (
            <div className="space-y-4">
              {orders.map((o) => (
                <div key={o._id} className="border border-border rounded-lg p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div>
                      <span className="font-medium">{o.orderNumber}</span>
                      <span className="text-muted-foreground text-sm ml-3">
                        {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        o.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        o.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        o.status === 'shipped' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {o.status}
                      </span>
                      {o.returnRequest && (
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          o.returnRequest.status === 'requested' ? 'bg-orange-100 text-orange-700' :
                          o.returnRequest.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                          o.returnRequest.status === 'refunded' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          Return: {o.returnRequest.status}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 mb-3">
                    {(o.items || []).map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm">
                        {item.image && (
                          <img src={item.image} alt={item.title} className="w-10 h-10 rounded object-cover" />
                        )}
                        <span className="flex-1">{item.title} × {item.quantity}</span>
                        <span className="text-muted-foreground">${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                    <span className="font-medium">Total: ${o.total}</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          // preseed the tracking modal with this order
                          const res = await getOrders({ orderNumber: o.orderNumber });
                          openTracking(res.data?.[0] || o);
                        }}
                        className="h-9 px-4 rounded-md border border-border text-sm inline-flex items-center gap-1.5 hover:bg-muted"
                      >
                        <Truck className="h-4 w-4" /> Track
                      </button>
                      {!o.returnRequest && o.status !== 'cancelled' && (
                        <button
                          type="button"
                          onClick={() => setReturnOrder(o)}
                          className="h-9 px-4 rounded-md border border-border text-sm inline-flex items-center gap-1.5 hover:bg-muted"
                        >
                          <RotateCcw className="h-4 w-4" /> Request Return
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* NOTIFICATIONS */}
      {tab === 'notifications' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium">Notifications</h2>
            {notifications.some((n) => !n.read) && (
              <button type="button" onClick={handleMarkAllRead} className="text-sm text-primary hover:underline">
                Mark all as read
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className="text-muted-foreground text-sm border border-dashed border-border rounded-lg p-6 text-center">
              You're all caught up.
            </p>
          ) : (
            <div className="space-y-2">
              {notifications.map((n) => (
                <div
                  key={n._id}
                  className={`border border-border rounded-lg p-4 ${n.read ? 'opacity-70' : 'bg-muted/30'}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-sm">{n.title}</p>
                      {n.message && <p className="text-sm text-muted-foreground mt-1">{n.message}</p>}
                      <p className="text-xs text-muted-foreground mt-2">
                        {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                      </p>
                    </div>
                    {!n.read && (
                      <button
                        type="button"
                        onClick={async () => {
                          await markRead(n._id);
                          setNotifications((prev) => prev.map((x) => (x._id === n._id ? { ...x, read: true } : x)));
                          setUnreadCount((c) => Math.max(0, c - 1));
                        }}
                        className="text-xs text-primary whitespace-nowrap"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* RETURN MODAL */}
      {returnOrder && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setReturnOrder(null)} aria-hidden />
          <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 w-full max-w-md bg-background rounded-lg shadow-2xl p-6">
            <h3 className="font-medium mb-1">Request Return</h3>
            <p className="text-sm text-muted-foreground mb-4">Order {returnOrder.orderNumber}</p>
            <form onSubmit={handleReturnSubmit} className="space-y-4">
              <textarea
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                placeholder="Tell us why you'd like to return this piece…"
                rows={4}
                required
                className="w-full rounded-md border border-border bg-background text-sm p-3 resize-none"
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-10 px-6 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
                >
                  {submitting ? 'Submitting…' : 'Submit Request'}
                </button>
                <button
                  type="button"
                  onClick={() => setReturnOrder(null)}
                  className="h-10 px-4 rounded-md border border-border text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
