import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Heart,
  ShoppingCart,
  Palette,
  Star,
  ChevronLeft,
  ArrowRight,
  Ruler,
  Frame,
} from 'lucide-react';
import { getArtworkById, getArtworks } from '../api/artwork.api';
import { getReviews, createReview } from '../api/review.api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { StarRating } from '../components/StarRating';
import { flyToCart } from '../utils/flyToCart';

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

// ── Dimension presets (width × height in inches) ──
const DIMENSION_PRESETS = [
  { label: '8 × 10"', width: 8, height: 10, area: 80 },
  { label: '12 × 16"', width: 12, height: 16, area: 192 },
  { label: '16 × 20"', width: 16, height: 20, area: 320 },
  { label: '20 × 24"', width: 20, height: 24, area: 480 },
  { label: '24 × 36"', width: 24, height: 36, area: 864 },
  { label: '30 × 40"', width: 30, height: 40, area: 1200 },
];

// Base reference area for price scaling (12 × 16 = 192 sq inches)
const BASE_AREA = 192;
const PREVIEW_SCALE_BASE = 30;

// ── Frame color options ──
const FRAME_COLORS = [
  { name: 'No Frame', color: 'transparent', hex: 'transparent', premium: 0, borderClass: 'border-dashed border-2 border-muted-foreground/40' },
  { name: 'Matte Black', color: '#1a1a1a', hex: '#1a1a1a', premium: 800, borderClass: '' },
  { name: 'Glossy Black', color: '#111111', hex: '#111111', premium: 900, borderClass: '' },
  { name: 'White', color: '#f5f5f5', hex: '#f5f5f5', premium: 800, borderClass: '' },
  { name: 'Natural Wood', color: '#c4a87c', hex: '#c4a87c', premium: 1200, borderClass: '' },
  { name: 'Dark Walnut', color: '#5c4033', hex: '#5c4033', premium: 1400, borderClass: '' },
  { name: 'Oak', color: '#b08d57', hex: '#b08d57', premium: 1300, borderClass: '' },
  { name: 'Gold', color: '#c5a54e', hex: '#c5a54e', premium: 2000, borderClass: '' },
  { name: 'Silver', color: '#b0b0b0', hex: '#b0b0b0', premium: 1800, borderClass: '' },
  { name: 'Champagne', color: '#d4c5a0', hex: '#d4c5a0', premium: 1500, borderClass: '' },
  { name: 'Bronze', color: '#8c7853', hex: '#8c7853', premium: 1600, borderClass: '' },
  { name: 'Rose Gold', color: '#b76e79', hex: '#b76e79', premium: 1900, borderClass: '' },
];

/**
 * Calculate dynamic price based on base price, selected area, and frame premium.
 * Larger dimensions → proportionally higher cost.
 */
function calculatePrice(basePrice, selectedArea, framePremium = 0) {
  const scaleFactor = selectedArea / BASE_AREA;
  const scaledPrice = Math.round(basePrice * scaleFactor);
  return scaledPrice + framePremium;
}

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

  // ── New: dimension & frame selection ──
  const [selectedDimension, setSelectedDimension] = useState(1); // index into DIMENSION_PRESETS (default: 12×16)
  const [customWidth, setCustomWidth] = useState('');
  const [customHeight, setCustomHeight] = useState('');
  const [useCustomDimension, setUseCustomDimension] = useState(false);
  const [selectedFrame, setSelectedFrame] = useState(0); // index into FRAME_COLORS

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

  // ── Compute selected area & dynamic price ──
  const selectedArea = useMemo(() => {
    if (useCustomDimension) {
      const w = parseFloat(customWidth) || 0;
      const h = parseFloat(customHeight) || 0;
      return w * h;
    }
    return DIMENSION_PRESETS[selectedDimension]?.area || BASE_AREA;
  }, [useCustomDimension, customWidth, customHeight, selectedDimension]);

  const dynamicPrice = useMemo(() => {
    if (!artwork) return 0;

    const framePremium = FRAME_COLORS[selectedFrame]?.premium || 0;
    const basePrice = calculatePrice(artwork.price ?? 0, selectedArea || BASE_AREA, framePremium);

    if (!wallImage) return basePrice;

    const previewScaleFactor = artPosition.scale / PREVIEW_SCALE_BASE;
    return Math.round(basePrice * previewScaleFactor);
  }, [artwork, selectedArea, selectedFrame, wallImage, artPosition.scale]);

  const currentDimensionLabel = useMemo(() => {
    if (useCustomDimension) {
      const w = parseFloat(customWidth) || 0;
      const h = parseFloat(customHeight) || 0;
      if (w > 0 && h > 0) return `${w} × ${h}"`;
      return 'Custom';
    }
    return DIMENSION_PRESETS[selectedDimension]?.label || '—';
  }, [useCustomDimension, customWidth, customHeight, selectedDimension]);

  const currentFrame = FRAME_COLORS[selectedFrame];

  const handleAddToCart = () => {
    flyToCart({
      from: document.querySelector('[data-cart-source]'),
      image: artwork.image || artwork.imageUrl,
    });
    addToCart({
      ...artwork,
      price: dynamicPrice,
      selectedDimension: currentDimensionLabel,
      selectedFrame: currentFrame.name,
      selectedFrameColor: currentFrame.hex,
    });
    push('Added to cart');
  };

  const handleBuyNow = () => {
    addToCart({
      ...artwork,
      price: dynamicPrice,
      selectedDimension: currentDimensionLabel,
      selectedFrame: currentFrame.name,
      selectedFrameColor: currentFrame.hex,
    });
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
            <div data-cart-source className="w-full aspect-square flex items-center justify-center p-8 rounded-lg transition-colors border border-border" style={{ backgroundColor: bgColor }}>
              {/* If a frame is selected, wrap the image in a visual frame */}
              {currentFrame.name !== 'No Frame' ? (
                <div
                  className="p-4 rounded-md max-w-full max-h-full flex items-center justify-center"
                  style={{
                    backgroundColor: currentFrame.hex,
                    border: `8px solid ${currentFrame.hex}`,
                    boxShadow: 'inset 0 0 10px rgba(0,0,0,0.15)',
                  }}
                >
                  <ImageWithFallback src={imageSrc} alt={artwork.title} className="max-w-full max-h-full object-contain" />
                </div>
              ) : (
                <ImageWithFallback src={imageSrc} alt={artwork.title} className="max-w-full max-h-full object-contain" />
              )}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-medium text-foreground">{artwork.title}</h1>
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

          {/* ── Dynamic Price ── */}
          <div>
            <div className="flex items-baseline gap-3">
              <p className="text-3xl font-medium text-foreground">₹{dynamicPrice.toLocaleString('en-IN')}</p>
              {dynamicPrice !== (artwork.price ?? 0) && (
                <p className="text-muted-foreground line-through">₹{(artwork.price ?? 0).toLocaleString('en-IN')}</p>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Base price: ₹{(artwork.price ?? 0).toLocaleString('en-IN')} · Size: {currentDimensionLabel} · Frame: {currentFrame.name}
              {currentFrame.premium > 0 && ` (+₹${currentFrame.premium.toLocaleString('en-IN')})`}
              {wallImage && ` · Preview scale: ${artPosition.scale}%`}
            </p>
          </div>

          {/* ── Dimension Selector ── */}
          <div className="border border-border rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Ruler className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium text-foreground">Select Size</h3>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {DIMENSION_PRESETS.map((dim, i) => {
                const frameP = FRAME_COLORS[selectedFrame]?.premium || 0;
                const presetPrice = calculatePrice(artwork.price ?? 0, dim.area, frameP);
                const isSelected = !useCustomDimension && selectedDimension === i;
                return (
                  <button
                    key={dim.label}
                    type="button"
                    onClick={() => {
                      setUseCustomDimension(false);
                      setSelectedDimension(i);
                    }}
                    className={`rounded-lg border-2 p-3 text-left transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                        : 'border-border hover:border-primary/40'
                    }`}
                  >
                    <span className="block text-sm font-medium text-foreground">{dim.label}</span>
                    <span className="block text-xs text-muted-foreground mt-0.5">₹{presetPrice.toLocaleString('en-IN')}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom dimension toggle */}
            <div className="border-t border-border pt-3">
              <button
                type="button"
                onClick={() => setUseCustomDimension(!useCustomDimension)}
                className={`text-sm font-medium transition-colors ${useCustomDimension ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {useCustomDimension ? '✓ Using custom size' : '+ Enter custom size'}
              </button>
              {useCustomDimension && (
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="120"
                      placeholder="W"
                      value={customWidth}
                      onChange={(e) => setCustomWidth(e.target.value)}
                      className="w-20 h-10 px-2 rounded-md border border-border bg-background text-sm text-center"
                    />
                    <span className="text-muted-foreground">×</span>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      placeholder="H"
                      value={customHeight}
                      onChange={(e) => setCustomHeight(e.target.value)}
                      className="w-20 h-10 px-2 rounded-md border border-border bg-background text-sm text-center"
                    />
                    <span className="text-xs text-muted-foreground">inches</span>
                  </div>
                  {selectedArea > 0 && (
                    <span className="text-sm text-foreground font-medium">₹{calculatePrice(artwork.price ?? 0, selectedArea, FRAME_COLORS[selectedFrame]?.premium || 0).toLocaleString('en-IN')}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Frame Color Selector ── */}
          <div className="border border-border rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Frame className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium text-foreground">Select Frame</h3>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {FRAME_COLORS.map((frame, i) => {
                const isSelected = selectedFrame === i;
                return (
                  <button
                    key={frame.name}
                    type="button"
                    onClick={() => setSelectedFrame(i)}
                    className={`rounded-lg border-2 p-2 text-center transition-all flex flex-col items-center gap-1.5 ${
                      isSelected
                        ? 'border-primary ring-1 ring-primary/20'
                        : 'border-border hover:border-primary/40'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full ${frame.borderClass}`}
                      style={frame.hex !== 'transparent' ? { backgroundColor: frame.hex } : {}}
                      title={frame.name}
                    />
                    <span className="text-xs text-foreground leading-tight">{frame.name}</span>
                    {frame.premium > 0 && (
                      <span className="text-[10px] text-muted-foreground">+₹{frame.premium.toLocaleString('en-IN')}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Add to cart / Buy Now */}
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

          {/* Summary of selections */}
          <div className="bg-muted/30 p-4 rounded-lg space-y-2">
            <h4 className="font-medium text-sm text-foreground">Your Selection</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Size</span>
                <p className="text-foreground">{currentDimensionLabel}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Frame</span>
                <p className="text-foreground">{currentFrame.name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Total Price</span>
                <p className="text-foreground font-medium">₹{dynamicPrice.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Area</span>
                <p className="text-foreground">{selectedArea > 0 ? `${selectedArea} sq in` : '—'}</p>
              </div>
            </div>
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
                <p className="text-muted-foreground">Selected Size</p>
                <p className="text-foreground">{currentDimensionLabel}</p>
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
                <p className="text-muted-foreground">Frame</p>
                <p className="text-foreground">{currentFrame.name}</p>
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
