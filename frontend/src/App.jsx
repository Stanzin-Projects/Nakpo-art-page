import { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import { Navigation } from './components/Navigation';
import { HeroSection } from './components/HeroSection';
import { ArtGallery } from './components/ArtGallery';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { ShoppingCart } from './components/ShoppingCart';
import { ArtworkDetailModal } from './components/ArtworkDetailModal';
import { Checkout } from './components/Checkout';
import { OrderTracking } from './components/OrderTracking';
import { getArtworks } from './api/artwork.api';

const defaultSiteContent = {
  general: {
    siteName: 'ARTBYLOPSANG',
    logo: 'https://images.cdn-files-a.com/uploads/7871374/400_filter_nobg_661f5231a6a43.png',
    tagline: 'Creating meaningful art that transforms spaces and touches hearts',
  },
  hero: {
    title: 'Art that Speaks to Your Soul',
    subtitle: 'Discover unique artworks that transform spaces',
    description:
      'Explore our curated collection of original paintings, limited edition prints, and commissioned artworks.',
    ctaText: 'Explore Gallery',
    backgroundImage: 'https://images.cdn-files-a.com/uploads/7871374/2000_644d45ca0954b.png',
  },
  about: {
    title: 'About the Artist',
    subtitle: 'Creating meaningful connections through art',
    description:
      'With over a decade of experience in contemporary art, I create pieces that bridge the gap between traditional techniques and modern expression.',
    image: 'https://images.cdn-files-a.com/uploads/7871374/2000_644a7ebe3625f_filter_645ca89d0848f.png',
    stats: [
      { value: '100+', label: 'Artworks Created' },
      { value: '50+', label: 'Happy Collectors' },
      { value: '5+', label: 'Years Experience' },
      { value: '10+', label: 'Exhibitions' },
    ],
  },
  contact: {
    title: 'Get in Touch',
    description: "Interested in commissioning a piece or learning more? I'd love to hear from you.",
    email: 'artist@artbylopsang.com',
    phone: '+1 (555) 123-4567',
    address: '123 Art District, Creative City, NY 10001',
    website: 'https://artbylopsang.com',
  },
};

function normalizeArtwork(a) {
  return {
    ...a,
    id: a._id || a.id,
    image: a.imageUrl || a.image,
  };
}

function App() {
  const [siteContent] = useState(defaultSiteContent);
  const [artworks, setArtworks] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderTrackingOpen, setIsOrderTrackingOpen] = useState(false);

  useEffect(() => {
    getArtworks()
      .then((res) => setArtworks((res.data || []).map(normalizeArtwork)))
      .catch(() => setArtworks([]));
  }, []);

  const cartItemCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const addToCart = (artwork) => {
    const item = normalizeArtwork(artwork);
    setCartItems((prev) => {
      const existing = prev.find((i) => (i.id || i._id) === (item.id || item._id));
      if (existing) {
        return prev.map((i) =>
          (i.id || i._id) === (item.id || item._id)
            ? { ...i, quantity: (i.quantity || 1) + 1 }
            : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateCartQuantity = (id, quantity) => {
    if (quantity < 1) {
      setCartItems((prev) => prev.filter((i) => (i.id || i._id) !== id));
      return;
    }
    setCartItems((prev) =>
      prev.map((i) => ((i.id || i._id) === id ? { ...i, quantity } : i))
    );
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((i) => (i.id || i._id) !== id));
  };

  const toggleFavorite = (artworkId) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(artworkId)) next.delete(artworkId);
      else next.add(artworkId);
      return next;
    });
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderComplete = () => {
    setCartItems([]);
    setIsCheckoutOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-20 right-4 z-40">
        <button
          type="button"
          onClick={() => setIsOrderTrackingOpen(true)}
          className="p-2 rounded-md border border-border bg-background hover:bg-muted transition-colors"
          title="Track order"
        >
          <Package className="h-4 w-4" />
        </button>
      </div>

      <Navigation cartItemCount={cartItemCount} onCartClick={() => setIsCartOpen(true)} />

      <main className="pt-16">
        <HeroSection siteContent={siteContent} />
        <ArtGallery
          artworks={artworks}
          onAddToCart={addToCart}
          onArtworkClick={setSelectedArtwork}
        />
        <AboutSection siteContent={siteContent} />
        <ContactSection siteContent={siteContent} />
      </main>

      <ShoppingCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={handleCheckout}
      />

      <Checkout
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        onOrderComplete={handleOrderComplete}
      />

      <OrderTracking isOpen={isOrderTrackingOpen} onClose={() => setIsOrderTrackingOpen(false)} />

      <ArtworkDetailModal
        artwork={selectedArtwork}
        isOpen={!!selectedArtwork}
        onClose={() => setSelectedArtwork(null)}
        onAddToCart={addToCart}
        isFavorite={selectedArtwork ? favorites.has(selectedArtwork.id || selectedArtwork._id) : false}
        onToggleFavorite={() => selectedArtwork && toggleFavorite(selectedArtwork.id || selectedArtwork._id)}
      />

      <footer className="py-12 lg:py-16 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="sm:col-span-2 lg:col-span-1">
              <h3 className="font-medium mb-4 text-foreground">{siteContent.general.siteName}</h3>
              <p className="text-muted-foreground text-sm max-w-md">{siteContent.general.tagline}</p>
            </div>
            <div>
              <h4 className="font-medium mb-4 text-foreground">Quick Links</h4>
              <div className="space-y-2 text-sm">
                <a href="#gallery" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Gallery
                </a>
                <a href="#about" className="block text-muted-foreground hover:text-foreground transition-colors">
                  About
                </a>
                <a href="#contact" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </a>
                <button
                  type="button"
                  onClick={() => setIsOrderTrackingOpen(true)}
                  className="block text-muted-foreground hover:text-foreground transition-colors text-left"
                >
                  Track Order
                </button>
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
            <p>© {new Date().getFullYear()} {siteContent.general.siteName}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
