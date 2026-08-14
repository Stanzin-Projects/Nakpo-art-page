import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export function Footer({ siteName, tagline }) {
  const navigate = useNavigate();
  const { openTracking } = useCart();

  const scrollTo = (id) => (e) => {
    e.preventDefault();
    if (window.location.pathname !== '/') {
      navigate('/', { state: { scrollTo: id } });
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="py-12 lg:py-16 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="font-medium mb-4 text-foreground">{siteName}</h3>
            <p className="text-muted-foreground text-sm max-w-md">{tagline}</p>
          </div>
          <div>
            <h4 className="font-medium mb-4 text-foreground">Quick Links</h4>
            <div className="space-y-2 text-sm">
              <a href="#gallery" onClick={scrollTo('gallery')} className="block text-muted-foreground hover:text-foreground transition-colors">
                Gallery
              </a>
              <a href="#about" onClick={scrollTo('about')} className="block text-muted-foreground hover:text-foreground transition-colors">
                About
              </a>
              <a href="#contact" onClick={scrollTo('contact')} className="block text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </a>
              <button
                type="button"
                onClick={openTracking}
                className="block text-muted-foreground hover:text-foreground transition-colors text-left"
              >
                Track Order
              </button>
              <Link to="/account" className="block text-muted-foreground hover:text-foreground transition-colors">
                My Account
              </Link>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-4 text-foreground">Policies</h4>
            <div className="space-y-2 text-sm">
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                Shipping & Returns
              </a>
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {siteName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
