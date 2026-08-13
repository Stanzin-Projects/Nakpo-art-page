import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-stone/10 bg-ink text-cream">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/" className="font-serif text-lg text-cream hover:text-gold transition-colors">
            Lopsang Rinchen
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link to="/gallery" className="hover:text-gold transition-colors">Gallery</Link>
            <Link to="/about" className="hover:text-gold transition-colors">About</Link>
            <Link to="/contact" className="hover:text-gold transition-colors">Contact</Link>
          </nav>
        </div>
        <p className="mt-6 text-center text-stone text-sm">
          © {year} Lopsang Rinchen. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
