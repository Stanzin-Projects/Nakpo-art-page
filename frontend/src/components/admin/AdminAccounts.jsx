import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Search,
  Users,
  Shield,
  ShieldOff,
  ShieldCheck,
  UserX,
  UserCheck,
  Trash2,
  Loader2,
} from 'lucide-react';
import { getAdminUsers, updateAdminUser, deleteAdminUser } from '../../api/admin.api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const money = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
const date = (d) => (d ? new Date(d).toLocaleDateString() : '—');

export function AdminAccounts() {
  const { user: me } = useAuth();
  const { push } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('all');
  const [busyId, setBusyId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminUsers();
      setUsers(res.data || []);
    } catch (err) {
      push(err.response?.data?.message || 'Could not load accounts', 'error');
    } finally {
      setLoading(false);
    }
  }, [push]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (q && !u.email.toLowerCase().includes(q) && !(u.name || '').toLowerCase().includes(q)) return false;
      if (role === 'admin' && !u.isAdmin) return false;
      if (role === 'buyer' && u.isAdmin) return false;
      if (status === 'active' && !u.isActive) return false;
      if (status === 'inactive' && u.isActive) return false;
      return true;
    });
  }, [users, query, role, status]);

  const admins = users.filter((u) => u.isAdmin).length;
  const inactive = users.filter((u) => !u.isActive).length;

  const patch = async (target, data, successMessage) => {
    setBusyId(target.id);
    try {
      const res = await updateAdminUser(target.id, data);
      setUsers((list) => list.map((u) => (u.id === target.id ? { ...u, ...res.data } : u)));
      push(successMessage, 'success');
    } catch (err) {
      push(err.response?.data?.message || 'Could not update that account', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (target) => {
    setBusyId(target.id);
    try {
      await deleteAdminUser(target.id);
      setUsers((list) => list.filter((u) => u.id !== target.id));
      setConfirmId(null);
      push(`${target.email} deleted`, 'success');
    } catch (err) {
      push(err.response?.data?.message || 'Could not delete that account', 'error');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Accounts" value={users.length} />
        <Stat label="Admins" value={admins} />
        <Stat label="Deactivated" value={inactive} />
        <Stat
          label="Registered buyers"
          value={users.filter((u) => !u.isAdmin && u.orders > 0).length}
          note="with at least one order"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email"
            className="w-full h-9 pl-9 pr-3 rounded-md border border-border bg-background text-sm"
          />
        </div>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="h-9 px-3 rounded-md border border-border bg-background text-sm"
          aria-label="Filter by role"
        >
          <option value="all">All roles</option>
          <option value="admin">Admins</option>
          <option value="buyer">Buyers</option>
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-9 px-3 rounded-md border border-border bg-background text-sm"
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Deactivated</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading accounts…</div>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground text-sm border border-dashed border-border rounded-lg p-8 text-center inline-flex items-center justify-center gap-2 w-full">
          <Users className="h-4 w-4" /> No accounts match those filters.
        </p>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="hidden lg:grid grid-cols-[1.7fr_0.7fr_0.6fr_0.7fr_0.8fr_auto] gap-4 px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground border-b border-border bg-muted/40">
            <span>Account</span>
            <span>Role</span>
            <span className="text-right">Orders</span>
            <span className="text-right">Spent</span>
            <span>Joined</span>
            <span />
          </div>

          {filtered.map((u) => {
            const isMe = String(u.id) === String(me?.id);
            const busy = busyId === u.id;
            const confirming = confirmId === u.id;

            return (
              <div key={u.id} className="border-b border-border last:border-b-0">
                <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_0.7fr_0.6fr_0.7fr_0.8fr_auto] gap-3 lg:gap-4 px-4 py-3 text-sm items-center">
                  <div className="min-w-0">
                    <span className="block font-medium truncate">
                      {u.name}
                      {isMe && <span className="ml-2 text-xs text-muted-foreground">(you)</span>}
                    </span>
                    <span className="block text-xs text-muted-foreground truncate">{u.email}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className={`text-xs px-2 py-0.5 rounded border ${
                        u.isAdmin
                          ? 'border-primary/40 bg-primary/10 text-primary'
                          : 'border-border bg-muted/40 text-muted-foreground'
                      }`}
                    >
                      {u.isAdmin ? 'Admin' : 'Buyer'}
                    </span>
                    {!u.isActive && (
                      <span className="text-xs px-2 py-0.5 rounded border border-destructive/40 bg-destructive/10 text-destructive">
                        Deactivated
                      </span>
                    )}
                  </div>

                  <span className="text-left lg:text-right text-muted-foreground lg:text-foreground">{u.orders}</span>
                  <span className="text-left lg:text-right font-medium">{money(u.spent)}</span>
                  <span className="text-xs text-muted-foreground">{date(u.createdAt)}</span>

                  <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    <button
                      type="button"
                      disabled={busy || isMe}
                      onClick={() =>
                        patch(u, { isAdmin: !u.isAdmin }, u.isAdmin ? 'Admin access removed' : 'Promoted to admin')
                      }
                      title={isMe ? 'You cannot change your own role' : u.isAdmin ? 'Remove admin access' : 'Make admin'}
                      className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-border text-xs hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {u.isAdmin ? <ShieldOff className="h-3.5 w-3.5" /> : <Shield className="h-3.5 w-3.5" />}
                      {u.isAdmin ? 'Demote' : 'Promote'}
                    </button>

                    <button
                      type="button"
                      disabled={busy || isMe}
                      onClick={() =>
                        patch(u, { isActive: !u.isActive }, u.isActive ? 'Account deactivated' : 'Account reactivated')
                      }
                      title={isMe ? 'You cannot deactivate your own account' : undefined}
                      className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-border text-xs hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {u.isActive ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                      {u.isActive ? 'Deactivate' : 'Reactivate'}
                    </button>

                    <button
                      type="button"
                      disabled={busy || isMe}
                      onClick={() => setConfirmId(confirming ? null : u.id)}
                      className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-destructive/40 text-xs text-destructive hover:bg-destructive/10 disabled:opacity-40 disabled:cursor-not-allowed"
                      title={isMe ? 'You cannot delete your own account' : 'Delete this account'}
                    >
                      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      Delete
                    </button>
                  </div>
                </div>

                {confirming && (
                  <div className="px-4 py-3 bg-destructive/5 border-t border-border text-sm flex flex-wrap items-center gap-3">
                    <span>
                      Delete <strong>{u.email}</strong> permanently? Their {u.orders} past order
                      {u.orders === 1 ? '' : 's'} stay on record as sales, but the login, reviews and
                      notifications are removed. This cannot be undone.
                    </span>
                    <div className="flex gap-2 ml-auto">
                      <button
                        type="button"
                        onClick={() => setConfirmId(null)}
                        className="h-8 px-3 rounded-md border border-border text-xs hover:bg-muted"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(u)}
                        disabled={busy}
                        className="h-8 px-3 rounded-md bg-destructive text-white text-xs font-medium inline-flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                        Delete forever
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Deactivating blocks sign-in, ordering, reviews and saved data changes until the account is
        reactivated. Order history is preserved either way.
      </p>
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
