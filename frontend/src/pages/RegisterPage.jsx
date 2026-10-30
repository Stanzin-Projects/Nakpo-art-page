import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      await register(name, email, password);
      push('Account created — welcome!');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create your account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-medium text-center mb-2">Create your account</h1>
        <p className="text-muted-foreground text-sm text-center mb-8">
          Keep your orders, tracking and reviews in one place.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4 border border-border rounded-lg p-6 bg-background">
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-md p-2">{error}</p>}
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 px-4 rounded-md border border-border bg-background text-sm"
              placeholder="Your name"
            />
          </div>
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
              placeholder="At least 6 characters"
            />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Confirm password</label>
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full h-10 px-4 rounded-md border border-border bg-background text-sm"
              placeholder="Repeat your password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-md bg-primary text-primary-foreground font-medium disabled:opacity-50"
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>
        <div className="text-center text-sm mt-6 space-y-2">
          <p className="text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-foreground hover:text-primary underline underline-offset-4">
              Sign in
            </Link>
          </p>
          <p>
            <Link to="/" className="text-muted-foreground hover:text-primary">
              Keep browsing as a guest
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
