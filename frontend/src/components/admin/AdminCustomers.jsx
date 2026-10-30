import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Users, ChevronDown, Loader2 } from 'lucide-react';
import { getAdminCustomers, getAdminOrders } from '../../api/admin.api';
import { useToast } from '../../context/ToastContext';

const money = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

export function AdminCustomers() {
  const { push } = useToast();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [openEmail, setOpenEmail] = useState(null);
  const [history, setHistory] = useState({});
  const [loadingHistory, setLoadingHistory] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await getAdminCustomers();
      setCustomers(res.data || []);
    } catch (err) {
      push(err.response?.data?.message || 'Could not load customers', 'error');
    } finally {
      setLoading(false);
    }
  }, [push]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) => c.email.toLowerCase().includes(q) || (c.name || '').toLowerCase().includes(q)
    );
  }, [customers, query]);

  const openCustomer = async (c) => {
    if (openEmail === c.email) {
      setOpenEmail(null);
      return;
    }
    setOpenEmail(c.email);
    if (history[c.email]) return;
    setLoadingHistory(true);
    try {
      const res = await getAdminOrders({ q: c.email });
      setHistory((h) => ({ ...h, [c.email]: res.data || [] }));
    } catch (err) {
      push(err.response?.data?.message || 'Could not load that buyer’s orders', 'error');
    } finally {
      setLoadingHistory(false);
    }
  };

  const totalSpent = customers.reduce((sum, c) => sum + c.spent, 0);
  const repeat = customers.filter((c) => c.orders > 1).length;

  if (loading) return <div className="text-center py-12 text-muted-foreground">Loading customers…</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Buyers" value={customers.length} />
        <Stat label="Lifetime value" value={money(totalSpent)} />
        <Stat label="Repeat buyers" value={repeat} />
        <Stat
          label="Top buyer"
          value={customers[0] ? money(customers[0].spent) : '—'}
          note={customers[0]?.email}
        />
      </div>

      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email"
          className="w-full h-9 pl-9 pr-3 rounded-md border border-border bg-background text-sm"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground text-sm border border-dashed border-border rounded-lg p-8 text-center inline-flex items-center justify-center gap-2 w-full">
          <Users className="h-4 w-4" /> No buyers yet.
        </p>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="hidden sm:grid grid-cols-[1.6fr_0.6fr_0.8fr_0.8fr_2rem] gap-4 px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground border-b border-border bg-muted/40">
            <span>Buyer</span>
            <span className="text-right">Orders</span>
            <span className="text-right">Spent</span>
            <span className="text-right">Last order</span>
            <span />
          </div>
          {filtered.map((c) => {
            const isOpen = openEmail === c.email;
            return (
              <div key={c.email} className="border-b border-border last:border-b-0">
                <button
                  type="button"
                  onClick={() => openCustomer(c)}
                  className="w-full grid grid-cols-[1fr_auto] sm:grid-cols-[1.6fr_0.6fr_0.8fr_0.8fr_2rem] gap-4 px-4 py-3 text-left text-sm hover:bg-muted/40 items-center"
                >
                  <span className="min-w-0">
                    <span className="block font-medium truncate">{c.name || c.email}</span>
                    <span className="block text-xs text-muted-foreground truncate">
                      {c.email}
                      {c.registered ? ' · account' : ' · guest'}
                    </span>
                  </span>
                  <span className="text-right">{c.orders}</span>
                  <span className="text-right font-medium hidden sm:block">{money(c.spent)}</span>
                  <span className="text-right text-muted-foreground text-xs hidden sm:block">
                    {c.lastOrderAt ? new Date(c.lastOrderAt).toLocaleDateString() : '—'}
                  </span>
                  <span className="hidden sm:flex justify-end">
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </span>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 bg-muted/20">
                    {loadingHistory && !history[c.email] ? (
                      <p className="text-sm text-muted-foreground py-3 inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Loading orders…
                      </p>
                    ) : (history[c.email] || []).length === 0 ? (
                      <p className="text-sm text-muted-foreground py-3">No orders on record.</p>
                    ) : (
                      <div className="divide-y divide-border">
                        {history[c.email].map((o) => (
                          <div key={o._id} className="flex flex-wrap items-center gap-3 py-2 text-sm">
                            <span className="font-medium">{o.orderNumber}</span>
                            <span className="text-xs px-2 py-0.5 rounded bg-background border border-border capitalize">
                              {o.status}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : ''}
                            </span>
                            <span className="ml-auto">{money(o.total)}</span>
                          </div>
                        ))}
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

function Stat({ label, value, note }) {
  return (
    <div className="border border-border rounded-lg p-4">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <p className="text-2xl font-medium mt-2">{value}</p>
      {note && <p className="text-xs text-muted-foreground mt-1 truncate">{note}</p>}
    </div>
  );
}
