import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Heart,
  ShoppingCart,
  Palette,
  Star,
  ChevronLeft,
  ArrowRight,
} from 'lucide-react';
import { getArtworkById, getArtworks } from '../api/artwork.api';
import { getReviews, createReview } from '../api/review.api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useRequireLogin } from '../utils/authFlow';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { StarRating } from '../components/StarRating';

const BACKGROUND_OPTIONS = [
  { name: 'Pure White', color: '#ffffff', value: 'pure-white' },
  { name: 'Off White', color: '#fefefe', value: 'off-white' },
  { name: 'Cream', color: '#fdfcf8', value: 'cream' },
  { name: 'Warm White', color: '#faf9f6', value: 'warm-white' },
  { name: 'Pearl Gray', color: '#f8f9fa', value: 'pearl-gray' },
  { name: 'Linen', color: '#faf0e6', value: 'linen' },
  { name: 'Silver', color: '#c0c0c0', value: 'silver' },
  { name: 'Gray', color: '#808080', value: 'gray' },
  { name: 'Slate', color: '#708090', value: 'slate' },
  { name: 'Charcoal', color: '#374151', value: 'charcoal' },
  { name: 'Deep Black', color: '#000000', value: 'deep-black' },
  { name: 'Sage Green', color: '#9caf88', value: 'sage-green' },
  { name: 'Mint', color: '#a8e6cf', value: 'mint' },
  { name: 'Emerald', color: '#046a38', value: 'emerald' },
  { name: 'Forest Green', color: '#2e5d34', value: 'forest-green' },
  { name: 'Olive', color: '#556b2f', value: 'olive' },
  { name: 'Teal', color: '#008080', value: 'teal' },
  { name: 'Turquoise', color: '#2dd4bf', value: 'turquoise' },
  { name: 'Sky Blue', color: '#87ceeb', value: 'sky-blue' },
  { name: 'Powder Blue', color: '#b0e0e6', value: 'powder-blue' },
  { name: 'Royal Blue', color: '#4169e1', value: 'royal-blue' },
  { name: 'Navy Blue', color: '#1e3a5f', value: 'navy-blue' },
  { name: 'Lavender', color: '#e6e6fa', value: 'lavender' },
  { name: 'Purple', color: '#7c3aed', value: 'purple' },
  { name: 'Violet', color: '#6d28d9', value: 'violet' },
  { name: 'Magenta', color: '#d946ef', value: 'magenta' },
  { name: 'Blush', color: '#ffe4e6', value: 'blush' },
  { name: 'Pink', color: '#ffc0cb', value: 'pink' },
  { name: 'Hot Pink', color: '#ec4899', value: 'hot-pink' },
  { name: 'Coral', color: '#ff7f50', value: 'coral' },
  { name: 'Salmon', color: '#fa8072', value: 'salmon' },
  { name: 'Red', color: '#ef4444', value: 'red' },
  { name: 'Crimson', color: '#dc143c', value: 'crimson' },
  { name: 'Burgundy', color: '#7f1d1d', value: 'burgundy' },
  { name: 'Terracotta', color: '#e2725b', value: 'terracotta' },
  { name: 'Rust', color: '#b7410e', value: 'rust' },
  { name: 'Orange', color: '#ff8c00', value: 'orange' },
  { name: 'Amber', color: '#f59e0b', value: 'amber' },
  { name: 'Peach', color: '#ffdab9', value: 'peach' },
  { name: 'Gold', color: '#fbbf24', value: 'gold' },
  { name: 'Mustard', color: '#eab308', value: 'mustard' },
  { name: 'Yellow', color: '#fde047', value: 'yellow' },
  { name: 'Sand', color: '#e7d8c9', value: 'sand' },
  { name: 'Beige', color: '#f5f5dc', value: 'beige' },
  { name: 'Tan', color: '#d2b48c', value: 'tan' },
  { name: 'Brown', color: '#8b4513', value: 'brown' },
];

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, openCheckout } = useCart();
  const { user, isFavorite, toggleFavorite } = useAuth();
  const { push } = useToast();
  const requireLogin = useRequireLogin();

  const [artwork, setArtwork] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState({ reviews: [], average: 0, count: 0 });
  const [selectedBackground, setSelectedBackground] = useState('pure-white');
  const [notFound, setNotFound] = useState(false);

  // review form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!id) return;
    setArtwork(null);
    setNotFound(false);
    getArtworkById(id)
      .then((res) => setArtwork(res.data))
      .catch(() => setNotFound(true));
    getReviews(id)
      .then((res) => setReviews(res.data))
      .catch(() => setReviews({ reviews: [], average: 0, count: 0 }));
    getArtworks()
      .then((res) => {
        const all = (res.data || []).map((a) => ({ ...a, id: a._id || a.id, image: a.imageUrl || a.image }));
        setRelated(all.filter((a) => String(a.id) !== String(id)).slice(0, 3));
      })
      .catch(() => setRelated([]));
  }, [id]);

  const bgColor =
    BACKGROUND_OPTIONS.find((o) => o.value === selectedBackground)?.color || '#ffffff';

  const handleAddToCart = () => {
    if (!requireLogin({ artworkId: artId, message: 'Sign in to add artworks to your cart' })) return;
    addToCart(artwork);
    push('Added to cart');
  };

  const handleBuyNow = () => {
    if (!requireLogin({ artworkId: artId, action: 'buy', message: 'Sign in to buy this artwork' })) return;
    addToCart(artwork);
    openCheckout();
  };

  const handleToggleFavorite = async () => {
    if (!artwork) return;
    const nowFav = await toggleFavorite(artwork.id || artwork._id);
    push(nowFav ? 'Added to wishlist' : 'Removed from wishlist', 'info');
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      push('Please write a short comment', 'error');
      return;
    }
    setSubmittingReview(true);
    try {
      await createReview(artwork.id || artwork._id, { rating, comment });
      const res = await getReviews(artwork.id || artwork._id);
      setReviews(res.data);
      setComment('');
      setRating(5);
      push('Thanks for your review!');
    } catch (err) {
      push(err.response?.data?.message || 'Could not submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (notFound) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-2xl font-medium mb-2">Artwork not found</h1>
        <Link to="/" className="text-primary hover:underline">
          ← Back to gallery
        </Link>
      </div>
    );
  }

  if (!artwork) {
    return <div className="min-h-[50vh] flex items-center justify-center text-muted-foreground">Loading…</div>;
  }

  const imageSrc = artwork.image || artwork.imageUrl;
  const artId = artwork.id || artwork._id;
  const fav = isFavorite(artId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="h-4 w-4" /> Back
      </button>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Preview */}
        <div className="space-y-4">
          <div className="bg-muted/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Preview Background</span>
            </div>
            <div className="grid grid-cols-8 gap-2">
              {BACKGROUND_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSelectedBackground(opt.value)}
                  className={`w-8 h-8 rounded-lg border-2 transition-all ${
                    selectedBackground === opt.value ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                  }`}
                  style={{ backgroundColor: opt.color }}
                  title={opt.name}
                />
              ))}
            </div>
          </div>
          <div
            className="w-full aspect-square flex items-center justify-center p-8 rounded-lg transition-colors border border-border"
            style={{ backgroundColor: bgColor }}
          >
            <ImageWithFallback src={imageSrc} alt={artwork.title} className="max-w-full max-h-full object-contain" />
          </div>
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-medium text-foreground">{artwork.title}</h1>
              <button
                type="button"
                onClick={handleToggleFavorite}
                className="p-2 hover:bg-muted rounded-full"
                title={fav ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart className={`h-6 w-6 ${fav ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
              </button>
            </div>
            <p className="text-muted-foreground text-sm mt-1">{artwork.medium}</p>
            <div className="flex items-center gap-2 mt-2">
              <StarRating value={reviews.average} />
              <span className="text-sm text-muted-foreground">
                {reviews.count > 0 ? `${reviews.average} (${reviews.count} review${reviews.count > 1 ? 's' : ''})` : 'No reviews yet'}
              </span>
            </div>
            <div className="flex gap-2 mt-3">
              <span className="rounded-md bg-primary text-primary-foreground px-2 py-0.5 text-xs">
                {artwork.isOriginal ? 'Original' : 'Print'}
              </span>
              <span className="rounded-md border border-border px-2 py-0.5 text-xs">{artwork.category}</span>
              {artwork.discount ? (
                <span className="rounded-md bg-red-600 text-white px-2 py-0.5 text-xs">{artwork.discount}% OFF</span>
              ) : null}
            </div>
          </div>

          <div>
            <p className="text-3xl font-medium text-foreground">${artwork.price ?? 0}</p>
            {artwork.originalPrice ? (
              <p className="text-muted-foreground line-through">${artwork.originalPrice}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleAddToCart}
              className="h-12 rounded-md border border-primary text-primary font-medium flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors"
            >
              <ShoppingCart className="h-5 w-5" /> Add to Cart
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              className="h-12 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              Buy Now
            </button>
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="font-medium mb-3 text-foreground">Description</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {artwork.description || 'A black-and-white study exploring line, light, and shadow.'}
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-3 text-foreground">Specifications</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Dimensions</p>
                <p className="text-foreground">{artwork.dimensions || '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Medium</p>
                <p className="text-foreground">{artwork.medium || '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Type</p>
                <p className="text-foreground">{artwork.isOriginal ? 'Original Artwork' : 'Limited Edition Print'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Category</p>
                <p className="text-foreground">{artwork.category || '—'}</p>
              </div>
            </div>
          </div>

          <div className="bg-muted/30 p-4 rounded-lg">
            <h4 className="font-medium mb-2 text-foreground">Shipping & Returns</h4>
            <p className="text-sm text-muted-foreground">
              Free shipping on orders over $300. Carefully packaged. 30-day return policy. Estimated delivery: 5–7 business days.
            </p>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-16 grid lg:grid-cols-2 gap-10">
        <div>
          <h2 className="text-xl font-medium mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 fill-amber-400 text-amber-400" /> Reviews ({reviews.count})
          </h2>
          {reviews.reviews.length === 0 ? (
            <p className="text-muted-foreground text-sm">No reviews yet. Be the first to review this artwork!</p>
          ) : (
            <div className="space-y-4">
              {reviews.reviews.map((r) => (
                <div key={r._id} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                        {(r.name || '?')[0].toUpperCase()}
                      </div>
                      <span className="font-medium text-sm">{r.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}
                    </span>
                  </div>
                  <StarRating value={r.rating} />
                  {r.comment && <p className="text-sm text-muted-foreground mt-2">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-medium mb-4">Write a Review</h2>
          {user ? (
            <form onSubmit={handleSubmitReview} className="space-y-4 border border-border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Your rating:</span>
                <StarRating value={rating} onChange={setRating} size="h-6 w-6" />
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts on this artwork…"
                rows={4}
                className="w-full rounded-md border border-border bg-background text-sm p-3 resize-none"
              />
              <button
                type="submit"
                disabled={submittingReview}
                className="h-10 px-6 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
              >
                {submittingReview ? 'Submitting…' : 'Submit Review'}
              </button>
            </form>
          ) : (
            <div className="border border-border rounded-lg p-6 text-center">
              <p className="text-muted-foreground text-sm mb-4">
                Sign in to leave a review and rate this artwork.
              </p>
              <Link to="/login" className="inline-block h-10 px-6 rounded-md bg-primary text-primary-foreground text-sm font-medium leading-10">
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-medium">You May Also Like</h2>
            <Link to="/" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {related.map((a) => (
              <Link
                key={a.id}
                to={`/product/${a.id}`}
                className="group block overflow-hidden rounded-lg border border-border hover:shadow-md transition-shadow"
              >
                <div className="aspect-[4/5] overflow-hidden bg-muted">
                  <ImageWithFallback
                    src={a.image}
                    alt={a.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-foreground">{a.title}</h3>
                  <p className="text-muted-foreground text-sm mt-1">${a.price ?? 0}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
