import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur border-b border-stone/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link to="/" className="font-serif text-xl text-ink hover:text-gold transition-colors">
          Lopsang Rinchen
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`text-sm uppercase tracking-wider transition-colors ${
                location.pathname === to ? 'text-gold font-medium' : 'text-stone hover:text-ink'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="md:hidden p-2 text-ink"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-stone/10 bg-cream px-4 py-4 flex flex-col gap-3">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`py-2 text-sm uppercase tracking-wider ${
                location.pathname === to ? 'text-gold font-medium' : 'text-stone'
              }`}
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
