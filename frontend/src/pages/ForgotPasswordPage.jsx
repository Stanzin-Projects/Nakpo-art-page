import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword } from '../api/auth.api';
import { useToast } from '../context/ToastContext';

export default function ForgotPasswordPage() {
  const { push } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await forgotPassword(email);
      setResult(res.data);
      push('Reset link generated', 'info');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not process request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-medium text-center mb-2">Reset Password</h1>
        <p className="text-muted-foreground text-sm text-center mb-8">
          Enter your account email and we'll generate a password reset link.
        </p>

        {result ? (
          <div className="space-y-4 border border-border rounded-lg p-6">
            <p className="text-sm text-green-700 bg-green-50 rounded-md p-3">{result.message}</p>
            <p className="text-xs text-muted-foreground">
              Demo mode: no email service is configured, so here is your reset link (valid 1 hour):
            </p>
            <div className="bg-muted rounded-md p-3 text-xs break-all font-mono">{result.resetUrl}</div>
            <button
              type="button"
              onClick={() => navigate(`/reset-password?token=${result.resetToken}&email=${encodeURIComponent(email)}`)}
              className="w-full h-11 rounded-md bg-primary text-primary-foreground font-medium"
            >
              Continue to Reset
            </button>
          </div>
        ) : (
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
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-md bg-primary text-primary-foreground font-medium disabled:opacity-50"
            >
              {loading ? 'Generating…' : 'Generate Reset Link'}
            </button>
          </form>
        )}

        <p className="text-center text-sm mt-6 text-muted-foreground">
          Remembered it?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
