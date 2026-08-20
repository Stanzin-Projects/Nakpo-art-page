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
import { ImageWithFallback } from '../components/ImageWithFallback';
import { StarRating } from '../components/StarRating';

const featuredStaticArtworks = [
  {
    id: 'featured-caravan-1',
    title: 'Mountain Caravan',
    imageUrl: '/caravan.webp',
    image: '/caravan.webp',
    price: 12500,
    originalPrice: 15000,
    discount: 17,
    category: 'Pen & Ink',
    medium: 'Ink on Paper',
    dimensions: '12 × 16 inches',
    description: 'A detailed pen and ink drawing depicting a caravan of yaks traversing through majestic mountain landscapes.',
    isOriginal: true,
    ratingAvg: 4.8,
    ratingCount: 12,
  },
  {
    id: 'featured-yak-1',
    title: 'The Yak',
    imageUrl: '/yak.webp',
    image: '/yak.webp',
    price: 9800,
    originalPrice: 12000,
    discount: 18,
    category: 'Pen & Ink',
    medium: 'Ink on Paper',
    dimensions: '12 × 16 inches',
    description: 'A striking portrait of a yak rendered in fine pen and ink, capturing the spirit of the Himalayan highlands.',
    isOriginal: true,
    ratingAvg: 4.9,
    ratingCount: 8,
  },
];

// Create a lookup for ALL featured artwork IDs (1-10) so any click works
const allFeaturedArtworks = [];
for (let i = 1; i <= 10; i++) {
  allFeaturedArtworks.push({
    ...featuredStaticArtworks[0],
    id: `featured-caravan-${i}`,
  });
  allFeaturedArtworks.push({
    ...featuredStaticArtworks[1],
    id: `featured-yak-${i}`,
  });
}

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
  { name: 'Periwinkle', color: '#ccccff', value: 'periwinkle' },
  { name: 'Indigo', color: '#4b0082', value: 'indigo' },
  { name: 'Plum', color: '#673147', value: 'plum' },
  { name: 'Wine', color: '#722f37', value: 'wine' },
  { name: 'Rose', color: '#ff66a1', value: 'rose' },
  { name: 'Maroon', color: '#800000', value: 'maroon' },
  { name: 'Chestnut', color: '#954535', value: 'chestnut' },
  { name: 'Coffee', color: '#6f4e37', value: 'coffee' },
  { name: 'Mocha', color: '#967969', value: 'mocha' },
  { name: 'Chocolate', color: '#7b3f00', value: 'chocolate' },
  { name: 'Khaki', color: '#c3b091', value: 'khaki' },
  { name: 'Ivory', color: '#fffff0', value: 'ivory' },
  { name: 'Stone', color: '#a8a29e', value: 'stone' },
  { name: 'Graphite', color: '#41424c', value: 'graphite' },
  { name: 'Gunmetal', color: '#2c3539', value: 'gunmetal' },
  { name: 'Steel Blue', color: '#4682b4', value: 'steel-blue' },
  { name: 'Cobalt', color: '#0047ab', value: 'cobalt' },
  { name: 'Cerulean', color: '#007ba7', value: 'cerulean' },
  { name: 'Cyan', color: '#00ffff', value: 'cyan' },
  { name: 'Aqua', color: '#7fdbda', value: 'aqua' },
  { name: 'Seafoam', color: '#b7e4c7', value: 'seafoam' },
  { name: 'Moss', color: '#8a9a5b', value: 'moss' },
  { name: 'Fern', color: '#4f7942', value: 'fern' },
  { name: 'Hunter Green', color: '#355e3b', value: 'hunter-green' },
];

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, openCheckout } = useCart();
  const { user, isFavorite, toggleFavorite } = useAuth();
  const { push } = useToast();

  const [artwork, setArtwork] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState({ reviews: [], average: 0, count: 0 });
  const [selectedBackground, setSelectedBackground] = useState('pure-white');
  const [notFound, setNotFound] = useState(false);
  const [wallImage, setWallImage] = useState(null);
  const [artPosition, setArtPosition] = useState({ x: 50, y: 50, scale: 30 });

  const handleWallUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setWallImage(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDragArt = (e) => {
    e.preventDefault();
    const box = e.currentTarget.parentElement.getBoundingClientRect();
    const onMove = (ev) => {
      const x = ((ev.clientX - box.left) / box.width) * 100;
      const y = ((ev.clientY - box.top) / box.height) * 100;
      setArtPosition((p) => ({ ...p, x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) }));
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // review form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!id) return;
    setArtwork(null);
    setNotFound(false);

    // Handle static featured artworks (caravan & yak)
    if (id.startsWith('featured-')) {
      const staticArt = allFeaturedArtworks.find((a) => a.id === id);
      if (staticArt) {
        setArtwork(staticArt);
        return;
      }
    }

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
    addToCart(artwork);
    push('Added to cart');
  };

  const handleBuyNow = () => {
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
                  className={"w-8 h-8 rounded-lg border-2 transition-all " + (selectedBackground === opt.value ? 'border-primary ring-2 ring-primary/20' : 'border-border')}
                  style={{ backgroundColor: opt.color }}
                  title={opt.name}
                />
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium">Upload Your Wall</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Upload a photo of your wall to see how this art will look in your space.</p>
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex flex-col items-center justify-center">
                  <span className="text-sm text-muted-foreground">Click to upload wall photo</span>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleWallUpload} />
              </label>
              {wallImage && (
                <button type="button" onClick={() => setWallImage(null)} className="mt-2 text-xs text-red-500 hover:text-red-600">Remove wall photo</button>
              )}
            </div>
          </div>

          {wallImage && (
            <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-border">
              <img src={wallImage} alt="Your wall" className="absolute inset-0 w-full h-full object-cover" />
              <div
                className="absolute cursor-move select-none"
                style={{ left: artPosition.x + '%', top: artPosition.y + '%', transform: 'translate(-50%, -50%)' }}
                onMouseDown={handleDragArt}
              >
                <ImageWithFallback src={imageSrc} alt={artwork.title} className="pointer-events-none drop-shadow-2xl" style={{ width: artPosition.scale + '%', height: 'auto' }} />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center gap-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                <span className="text-white text-xs whitespace-nowrap">Art Size:</span>
                <input type="range" min="10" max="80" value={artPosition.scale} onChange={(e) => setArtPosition((p) => ({ ...p, scale: Number(e.target.value) }))} className="flex-1" />
                <span className="text-white text-xs">Drag art to position</span>
              </div>
            </div>
          )}
          {!wallImage && (
            <div className="w-full aspect-square flex items-center justify-center p-8 rounded-lg transition-colors border border-border" style={{ backgroundColor: bgColor }}>
              <ImageWithFallback src={imageSrc} alt={artwork.title} className="max-w-full max-h-full object-contain" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-medium text-foreground">{artwork.title}</h1>
              {/* Wishlist is a shopping action — hidden for the admin */}
              {!user?.isAdmin && (
                <button
                  type="button"
                  onClick={handleToggleFavorite}
                  className="p-2 hover:bg-muted rounded-full"
                  title={fav ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart className={`h-6 w-6 ${fav ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
                </button>
              )}
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
            <p className="text-3xl font-medium text-foreground">₹{artwork.price ?? 0}</p>
            {artwork.originalPrice ? (
              <p className="text-muted-foreground line-through">₹{artwork.originalPrice}</p>
            ) : null}
          </div>

          {/* Add to cart / Buy Now are shopping actions — hidden for the admin */}
          {!user?.isAdmin && (
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
          )}

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
              Free shipping on orders over ₹300. Carefully packaged. 30-day return policy. Estimated delivery: 5–7 business days.
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
                  <p className="text-muted-foreground text-sm mt-1">₹{a.price ?? 0}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
