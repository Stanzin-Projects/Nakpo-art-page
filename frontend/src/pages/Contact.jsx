import { useState } from 'react';
import { submitContact } from '../api/contact.api';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState({ type: null, message: '' });
  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setStatus({ type: null, message: '' });
    try {
      await submitContact(form);
      setStatus({ type: 'success', message: 'Thank you. Your message has been sent.' });
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.response?.data?.message || 'Something went wrong. Please try again.',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="font-serif text-3xl text-ink mb-2">Contact</h1>
      <p className="text-stone mb-8">Get in touch for commissions or inquiries.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-ink mb-1">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={form.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-stone/30 rounded bg-cream text-ink focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink mb-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-stone/30 rounded bg-cream text-ink focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-ink mb-1">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            required
            value={form.message}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-stone/30 rounded bg-cream text-ink focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent resize-y"
          />
        </div>
        {status.message && (
          <p
            className={
              status.type === 'success'
                ? 'text-green-700'
                : 'text-red-600'
            }
          >
            {status.message}
          </p>
        )}
        <button
          type="submit"
          disabled={sending}
          className="w-full sm:w-auto px-8 py-3 bg-ink text-cream rounded-sm uppercase tracking-wider text-sm font-medium hover:bg-gold transition-colors disabled:opacity-50"
        >
          {sending ? 'Sending…' : 'Send'}
        </button>
      </form>
    </div>
  );
}
