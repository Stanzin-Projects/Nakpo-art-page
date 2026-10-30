import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Grid, List, Heart, ShoppingCart, Percent, ArrowRight, X, Star } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';
import { GalleryMarquee } from './GalleryMarquee';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { flyToCart } from '../utils/flyToCart';

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Rating' },
];

export function ArtGallery({ artworks = [], siteContent }) {
  const galleryContent = siteContent?.gallery || {};
  const sale = siteContent?.sale || {};
  const salePercent = Number(sale.percent) || 0;
  const saleEnded = sale.endsAt ? new Date(sale.endsAt).getTime() < Date.now() : false;
  const saleLive = !!sale.active && salePercent > 0 && !saleEnded;
  const navigate = useNavigate();
  const { user, isFavorite, toggleFavorite } = useAuth();
  const { addToCart } = useCart();
  const { push } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('featured');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [medium, setMedium] = useState('All');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  const categories = useMemo(() => ['All', ...new Set(artworks.map((a) => a.category).filter(Boolean))], [artworks]);
  const mediums = useMemo(() => ['All', ...new Set(artworks.map((a) => a.medium).filter(Boolean))], [artworks]);

  // click outside closes the suggestion dropdown
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const suggestions = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return [];
    return artworks
      .filter((a) => (a.title || '').toLowerCase().includes(q))
      .slice(0, 6);
  }, [artworks, searchTerm]);

  const filteredArtworks = useMemo(() => {
    let list = artworks.filter((art) => {
      const matchSearch =
        (art.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (art.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = selectedCategory === 'All' || art.category === selectedCategory;
      const matchMedium = medium === 'All' || art.medium === medium;
      const price = art.price ?? 0;
      const matchPrice =
        (minPrice === '' || price >= Number(minPrice)) && (maxPrice === '' || price <= Number(maxPrice));
      return matchSearch && matchCat && matchMedium && matchPrice;
    });

    switch (sortBy) {
      case 'price-asc':
        list = [...list].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        break;
      case 'price-desc':
        list = [...list].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
        break;
      case 'rating':
        list = [...list].sort((a, b) => (b.ratingAvg ?? 0) - (a.ratingAvg ?? 0));
        break;
      case 'newest':
        list = [...list].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      default:
        break;
    }
    return list;
  }, [artworks, searchTerm, selectedCategory, medium, minPrice, maxPrice, sortBy]);

  const imageUrl = (art) => art.image || art.imageUrl;

  const handleSuggestionClick = (art) => {
    setSearchTerm('');
    setShowSuggestions(false);
    navigate(`/product/${art.id || art._id}`);
  };

  const openArtwork = (art) => {
    navigate(`/product/${art.id || art._id}`);
  };

  const handleToggleFavorite = async (e, art) => {
    e.stopPropagation();
    try {
      const nowFav = await toggleFavorite(art.id || art._id);
      push(nowFav ? 'Added to wishlist' : 'Removed from wishlist', 'info');
    } catch {
      push('Could not update wishlist', 'error');
    }
  };

  const handleAddToCart = (e, art) => {
    e.stopPropagation();
    const source = e.currentTarget.closest('[data-cart-source]')?.querySelector('img') || e.currentTarget;
    flyToCart({ from: source, image: imageUrl(art) });
    addToCart(art);
    push('Added to cart');
  };

  return (
    <section id="gallery" className="pt-2 pb-16 lg:pb-20 scroll-mt-16">
      <GalleryMarquee artworks={artworks} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {saleLive && (
          <div className="mb-10 flex justify-center">
            <div className="inline-flex flex-wrap items-center justify-center gap-2 rounded-full bg-destructive px-5 py-2 text-sm font-medium text-white">
              <Percent className="h-4 w-4" />
              <span>
                {sale.label ? `${sale.label} — ` : ''}
                {salePercent}% off everything
              </span>
              {sale.endsAt && (
                <span className="opacity-85">
                  · ends{' '}
                  {new Date(sale.endsAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-medium mb-4 text-foreground">
            {galleryContent.title || 'Art Gallery'}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {galleryContent.description ||
              'Explore our collection of original artworks and limited edition prints. Each piece is carefully crafted to bring beauty and meaning to your space.'}
          </p>
        </div>

        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
            {/* Search with autocomplete */}
            <div className="relative flex-1 w-full sm:max-w-md" ref={searchRef}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search artworks..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && suggestions.length > 0) {
                    handleSuggestionClick(suggestions[0]);
                  }
                }}
                className="w-full h-10 pl-10 pr-4 rounded-md border border-border bg-background text-foreground text-sm"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-11 left-0 right-0 bg-background border border-border rounded-md shadow-lg z-30 overflow-hidden">
                  {suggestions.map((art) => (
                    <button
                      key={art.id || art._id}
                      type="button"
                      onClick={() => handleSuggestionClick(art)}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted text-left"
                    >
                      <img src={imageUrl(art)} alt="" className="w-9 h-9 rounded object-cover" />
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-medium truncate">{art.title}</span>
                        <span className="block text-xs text-muted-foreground">₹{art.price ?? 0}</span>
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`inline-flex items-center gap-2 h-9 px-4 rounded-md text-sm font-medium ${
                  viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-muted'
                }`}
              >
                <Grid className="h-4 w-4" />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`inline-flex items-center gap-2 h-9 px-4 rounded-md text-sm font-medium ${
                  viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-muted'
                }`}
              >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>
          </div>

          {/* Filters + sort */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-2 items-center">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap text-sm h-9 px-4 rounded-md ${
                    selectedCategory === cat ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-muted'
                  }`}
                >
                  {cat}
                </button>
              ))}
              <select
                value={medium}
                onChange={(e) => setMedium(e.target.value)}
                className="h-9 px-3 rounded-md border border-border bg-background text-sm"
                title="Medium"
              >
                {mediums.map((m) => (
                  <option key={m} value={m}>
                    {m === 'All' ? 'All Mediums' : m}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  placeholder="Min ₹"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-20 h-9 px-2 rounded-md border border-border bg-background text-sm"
                  title="Min price"
                />
                <span className="text-muted-foreground">–</span>
                <input
                  type="number"
                  placeholder="Max ₹"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-20 h-9 px-2 rounded-md border border-border bg-background text-sm"
                  title="Max price"
                />
                {(minPrice !== '' || maxPrice !== '') && (
                  <button
                    type="button"
                    onClick={() => {
                      setMinPrice('');
                      setMaxPrice('');
                    }}
                    className="h-9 w-9 rounded-md border border-border inline-flex items-center justify-center text-muted-foreground hover:text-foreground"
                    title="Clear price filter"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-9 px-3 rounded-md border border-border bg-background text-sm"
              title="Sort by"
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  Sort: {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          {filteredArtworks.length} piece{filteredArtworks.length === 1 ? '' : 's'}
        </p>

        <div
          className={`grid gap-4 sm:gap-6 ${
            viewMode === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
              : 'grid-cols-1'
          }`}
        >
          {filteredArtworks.map((artwork) => {
            const artId = artwork.id || artwork._id;
            const fav = isFavorite(artId);
            return (
              <div
                key={artId}
                data-cart-source
                className="cursor-pointer"
                onClick={() => openArtwork(artwork)}
                onKeyDown={(e) => e.key === 'Enter' && openArtwork(artwork)}
                role="button"
                tabIndex={0}
              >
                <div className="relative">
                  <ImageWithFallback
                    src={imageUrl(artwork)}
                    alt={artwork.title}
                    className={`w-full object-cover rounded-lg transition-transform hover:scale-[1.02] ${
                      viewMode === 'grid' ? 'aspect-[3/4]' : 'aspect-[16/9]'
                    }`}
                  />
                  {/* Wishlist/cart are shopping actions — hidden for the admin */}
                  {!user?.isAdmin && (
                    <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleToggleFavorite(e, artwork)}
                        className="p-2 bg-white/90 rounded-full shadow-sm hover:bg-white"
                        title={fav ? 'Remove from wishlist' : 'Add to wishlist'}
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            fav ? 'fill-red-500 text-red-500' : 'text-gray-600'
                          }`}
                        />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(e, artwork)}
                        className="p-2 bg-white/90 rounded-full shadow-sm hover:bg-white"
                        title="Add to cart"
                      >
                        <ShoppingCart className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  )}
                  <div className="absolute top-2 left-2 sm:top-4 sm:left-4 flex gap-2">
                    {artwork.isOriginal && (
                      <span className="inline-flex items-center rounded-md bg-secondary text-secondary-foreground px-2 py-0.5 text-xs">
                        Original
                      </span>
                    )}
                    {artwork.discount && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-destructive text-white px-2 py-0.5 text-xs">
                        <Percent className="h-3 w-3" />
                        {artwork.discount}% OFF
                      </span>
                    )}
                  </div>
                  {artwork.ratingCount > 0 && (
                    <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 flex items-center gap-1 rounded-md bg-white/90 px-2 py-0.5 text-xs shadow-sm">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span className="font-medium">{artwork.ratingAvg}</span>
                      <span className="text-gray-500">({artwork.ratingCount})</span>
                    </div>
                  )}
                </div>
                <div className="p-4 bg-transparent">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div>
                      <h3 className="font-medium text-base text-foreground truncate">{artwork.title}</h3>
                      <p className="text-muted-foreground text-sm">{artwork.medium}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">₹{artwork.price ?? 0}</p>
                      {artwork.originalPrice && (
                        <p className="text-muted-foreground text-sm line-through">₹{artwork.originalPrice}</p>
                      )}
                      <p className="text-muted-foreground text-sm">{artwork.dimensions}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm line-clamp-2">{artwork.description}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="rounded-md border border-border px-2 py-0.5 text-xs">{artwork.category}</span>
                    <span className="text-sm font-medium text-primary">View Details</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredArtworks.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">No artworks found matching your criteria.</div>
        )}
      </div>
    </section>
  );
}
