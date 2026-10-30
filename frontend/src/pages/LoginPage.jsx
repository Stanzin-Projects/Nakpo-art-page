import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useCompleteLoginIntent } from '../utils/authFlow';

export default function LoginPage() {
  const { login } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const completeLoginIntent = useCompleteLoginIntent();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      push('Welcome back!');
      // always fulfil any pending buy intent, then go where the user was headed
      const pendingTarget = await completeLoginIntent();
      navigate(searchParams.get('redirect') || pendingTarget || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-medium text-center mb-2">Sign In</h1>
        <p className="text-muted-foreground text-sm text-center mb-8">
          Sign in to follow your orders, track deliveries and review the art. You can also order as a guest.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4 border border-border rounded-lg p-6 bg-background">
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-md p-2">{error}</p>}
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 px-4 rounded-md border border-border bg-background text-sm"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-10 px-4 rounded-md border border-border bg-background text-sm"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-md bg-primary text-primary-foreground font-medium disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <div className="text-center text-sm mt-6 space-y-2">
          <p className="text-muted-foreground">
            New here?{' '}
            <Link to="/register" className="text-foreground hover:text-primary underline underline-offset-4">
              Create an account
            </Link>
          </p>
          <p>
            <Link to="/forgot-password" className="text-muted-foreground hover:text-primary">
              Forgot your password?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
