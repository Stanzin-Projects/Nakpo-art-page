import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../api/auth.api';
import { useToast } from '../context/ToastContext';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { push } = useToast();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await resetPassword({ email, token, password });
      setDone(true);
      push('Password updated — you can now sign in');
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-xl font-medium mb-2">Invalid reset link</h1>
        <p className="text-muted-foreground text-sm mb-4">This link is missing its token. Please request a new one.</p>
        <Link to="/forgot-password" className="text-primary hover:underline">
          Request a new reset link
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-medium text-center mb-2">Choose a New Password</h1>
        <p className="text-muted-foreground text-sm text-center mb-8">For {email}</p>
        {done ? (
          <div className="text-center border border-border rounded-lg p-8">
            <p className="text-green-700 mb-4">Password updated successfully!</p>
            <Link to="/login" className="inline-block h-11 px-6 rounded-md bg-primary text-primary-foreground font-medium leading-11">
              Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 border border-border rounded-lg p-6 bg-background">
            {error && <p className="text-sm text-red-600 bg-red-50 rounded-md p-2">{error}</p>}
            <div>
              <label className="block text-sm text-muted-foreground mb-1">New Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 px-4 rounded-md border border-border bg-background text-sm"
                placeholder="At least 6 characters"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full h-10 px-4 rounded-md border border-border bg-background text-sm"
                placeholder="Repeat password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-md bg-primary text-primary-foreground font-medium disabled:opacity-50"
            >
              {loading ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
