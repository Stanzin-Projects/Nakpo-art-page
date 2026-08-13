import { useState } from 'react';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';

const LOGO_URL = 'https://images.cdn-files-a.com/uploads/7871374/400_filter_nobg_661f5231a6a43.png';
const navItems = [
  { href: '#home', label: 'Home' },
  { href: '#gallery', label: 'Gallery' },
  { href: '#about', label: 'About' },
  { href: '#contact', label: 'Contact' },
];

export function Navigation({ cartItemCount, onCartClick }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <a href="#home" className="flex items-center gap-3" onClick={() => setIsMobileMenuOpen(false)}>
            <ImageWithFallback src={LOGO_URL} alt="ArtByLopsang Logo" className="h-10 w-auto object-contain" />
            <span className="font-medium text-xl text-foreground">ARTBYLOPSANG</span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-foreground/80 hover:text-foreground px-3 py-2 transition-colors text-sm"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onCartClick}
              className="relative inline-flex items-center justify-center h-9 px-4 rounded-md border border-border bg-background text-sm font-medium hover:bg-muted transition-colors"
            >
              <ShoppingCart className="h-4 w-4" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs">
                  {cartItemCount}
                </span>
              )}
            </button>

            <button
              type="button"
              className="md:hidden p-2 hover:bg-muted rounded-md"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-1">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block text-foreground/80 hover:text-foreground px-3 py-2 text-sm"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
