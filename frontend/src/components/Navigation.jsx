import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, Heart, Bell, ChevronDown, Package } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getUnreadCount } from '../api/notification.api';

const LOGO_URL = 'https://images.cdn-files-a.com/uploads/7871374/400_filter_nobg_661f5231a6a43.png';
const navItems = [
  { href: '#home', label: 'Home' },
  { href: '#gallery', label: 'Gallery' },
  { href: '#about', label: 'About' },
  { href: '#contact', label: 'Contact' },
];

export function Navigation({ onTrackClick }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const { itemCount, openCart } = useCart();
  const { user, token, logout, favoriteIds } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!token) {
      setUnread(0);
      return;
    }
    getUnreadCount()
      .then((res) => setUnread(res.data.count))
      .catch(() => setUnread(0));
  }, [token, location.pathname]);

  // close menus on navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname, location.hash]);

  const scrollToSection = (e, href) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: href.slice(1) } });
      return;
    }
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  const userCount = favoriteIds.length;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-3">
            <ImageWithFallback src={LOGO_URL} alt="ArtByLopsang Logo" className="h-10 w-auto object-contain" />
            <span className="font-medium text-xl text-foreground">ARTBYLOPSANG</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => scrollToSection(e, item.href)}
                className="text-foreground/80 hover:text-foreground px-3 py-2 transition-colors text-sm"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Wishlist — shopping only, hidden for the admin */}
            {!user?.isAdmin && (
              <Link
                to="/wishlist"
                className="relative inline-flex items-center justify-center h-9 w-9 rounded-md border border-border hover:bg-muted transition-colors"
                title="Wishlist"
              >
                <Heart className="h-4 w-4" />
                {userCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs">
                    {userCount}
                  </span>
                )}
              </Link>
            )}

            {/* Notifications */}
            {token && (
              <Link
                to="/account?tab=notifications"
                className="relative inline-flex items-center justify-center h-9 w-9 rounded-md border border-border hover:bg-muted transition-colors"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unread > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                    {unread}
                  </span>
                )}
              </Link>
            )}

            {/* Track order */}
            <button
              type="button"
              onClick={onTrackClick}
              className="hidden sm:inline-flex items-center justify-center h-9 px-3 rounded-md border border-border hover:bg-muted transition-colors text-sm"
              title="Track order"
            >
              <Package className="h-4 w-4" />
            </button>

            {/* Cart — shopping only, hidden for the admin */}
            {!user?.isAdmin && (
              <button
                type="button"
                onClick={openCart}
                data-cart-target
                className="relative inline-flex items-center justify-center h-9 px-4 rounded-md border border-border bg-background text-sm font-medium hover:bg-muted transition-colors"
                title="Shopping cart"
              >
                <span
                  data-cart-ping
                  className="pointer-events-none absolute inset-0 rounded-md border-2 border-primary opacity-0"
                  aria-hidden="true"
                />
                <ShoppingCart className="h-4 w-4" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs">
                    {itemCount}
                  </span>
                )}
              </button>
            )}

            {/* User menu */}
            {token && user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 h-9 px-3 rounded-md border border-border hover:bg-muted transition-colors"
                >
                  <span className="text-sm font-medium max-w-[10rem] truncate">{user.name}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-lg py-1 z-50">
                    {user.isAdmin && (
                      <Link to="/admin" className="block px-4 py-2 text-sm hover:bg-muted">
                        Admin Panel
                      </Link>
                    )}
                    <Link to="/account" className="block px-4 py-2 text-sm hover:bg-muted">
                      Dashboard
                    </Link>
                    <Link to="/account?tab=orders" className="block px-4 py-2 text-sm hover:bg-muted">
                      My Orders
                    </Link>
                    <Link to="/account?tab=addresses" className="block px-4 py-2 text-sm hover:bg-muted">
                      Addresses
                    </Link>
                    <Link to="/wishlist" className="block px-4 py-2 text-sm hover:bg-muted">
                      Wishlist
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        navigate('/');
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-muted"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center justify-center h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Sign In
              </Link>
            )}

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
                onClick={(e) => scrollToSection(e, item.href)}
                className="block text-foreground/80 hover:text-foreground px-3 py-2 text-sm"
              >
                {item.label}
              </a>
            ))}
            {!user?.isAdmin && (
              <Link to="/wishlist" className="block text-foreground/80 hover:text-foreground px-3 py-2 text-sm">
                Wishlist
              </Link>
            )}
            <Link to="/account" className="block text-foreground/80 hover:text-foreground px-3 py-2 text-sm">
              My Account
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
