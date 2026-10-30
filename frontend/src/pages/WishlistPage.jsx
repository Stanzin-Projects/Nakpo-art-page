import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { getArtworks } from '../api/artwork.api';
import { getFavorites } from '../api/user.api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { flyToCart } from '../utils/flyToCart';

export default function WishlistPage() {
  const { user, favoriteIds, toggleFavorite } = useAuth();
  const { addToCart } = useCart();
  const { push } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        let favs;
        if (user) {
          const res = await getFavorites();
          favs = res.data;
        } else {
          const res = await getArtworks();
          const all = res.data || [];
          favs = all.filter((a) => favoriteIds.includes(String(a._id || a.id)));
        }
        if (mounted) setItems(favs);
      } catch {
        if (mounted) setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [user, favoriteIds]);

  const handleRemove = async (id) => {
    await toggleFavorite(id);
    setItems((prev) => prev.filter((a) => String(a._id || a.id) !== String(id)));
    push('Removed from wishlist', 'info');
  };

  if (loading) {
    return <div className="min-h-[50vh] flex items-center justify-center text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-2xl font-medium mb-2">Your Wishlist</h1>
      <p className="text-muted-foreground text-sm mb-8">
        {items.length > 0 ? `${items.length} saved piece${items.length > 1 ? 's' : ''}` : 'Nothing saved yet'}
      </p>

      {items.length === 0 ? (
        <div className="text-center py-16 border border-border rounded-lg">
          <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-6">Tap the heart on any artwork to save it here.</p>
          <Link to="/" className="inline-block h-10 px-6 rounded-md bg-primary text-primary-foreground text-sm font-medium leading-10">
            Browse the Gallery
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((art) => {
            const id = art._id || art.id;
            const image = art.imageUrl || art.image;
            return (
              <div key={String(id)} data-cart-source className="border border-border rounded-lg overflow-hidden flex flex-col">
                <Link to={`/product/${id}`} className="block">
                  <div className="aspect-[4/5] overflow-hidden bg-muted">
                    <ImageWithFallback
                      src={image}
                      alt={art.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </Link>
                <div className="p-4 flex-1 flex flex-col">
                  <Link to={`/product/${id}`}>
                    <h3 className="font-medium hover:text-primary transition-colors">{art.title}</h3>
                  </Link>
                  <p className="text-muted-foreground text-sm mt-1">{art.medium}</p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="font-medium">₹{art.price ?? 0}</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          const source =
                            e.currentTarget.closest('[data-cart-source]')?.querySelector('img') ||
                            e.currentTarget;
                          flyToCart({ from: source, image });
                          addToCart(art);
                          push('Added to cart');
                        }}
                        className="h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm font-medium inline-flex items-center gap-1.5"
                      >
                        <ShoppingCart className="h-4 w-4" /> Add
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove(id)}
                        className="h-9 w-9 rounded-md border border-border inline-flex items-center justify-center text-muted-foreground hover:text-red-600 hover:border-red-300"
                        title="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
