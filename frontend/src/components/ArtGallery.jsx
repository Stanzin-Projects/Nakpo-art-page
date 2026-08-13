import { useState } from 'react';
import { Search, Grid, List, Heart, ShoppingCart, Percent } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';

export function ArtGallery({ artworks = [], onAddToCart, onArtworkClick }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [favorites, setFavorites] = useState(new Set());

  const categories = ['All', ...new Set(artworks.map((a) => a.category).filter(Boolean))];

  const filteredArtworks = artworks.filter((art) => {
    const matchSearch =
      (art.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (art.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory === 'All' || art.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const imageUrl = (art) => art.image || art.imageUrl;

  return (
    <section id="gallery" className="py-16 lg:py-20 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-medium mb-4 text-foreground">Art Gallery</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore our collection of original artworks and limited edition prints. Each piece is carefully crafted to bring beauty and meaning to your space.
          </p>
        </div>

        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search artworks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-md border border-border bg-background text-foreground text-sm"
              />
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

          <div className="flex gap-2 overflow-x-auto pb-2">
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
          </div>
        </div>

        <div
          className={`grid gap-4 sm:gap-6 ${
            viewMode === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
              : 'grid-cols-1'
          }`}
        >
          {filteredArtworks.map((artwork) => (
            <div
              key={artwork.id || artwork._id}
              className="cursor-pointer"
              onClick={() => onArtworkClick(artwork)}
              onKeyDown={(e) => e.key === 'Enter' && onArtworkClick(artwork)}
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
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(artwork.id || artwork._id);
                    }}
                    className="p-2 bg-white/90 rounded-full shadow-sm hover:bg-white"
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        favorites.has(artwork.id || artwork._id) ? 'fill-red-500 text-red-500' : 'text-gray-600'
                      }`}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart(artwork);
                    }}
                    className="p-2 bg-white/90 rounded-full shadow-sm hover:bg-white"
                  >
                    <ShoppingCart className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
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
              </div>
              <div className="p-4 bg-transparent">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div>
                    <h3 className="font-medium text-base text-foreground truncate">{artwork.title}</h3>
                    <p className="text-muted-foreground text-sm">{artwork.medium}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">${artwork.price ?? 0}</p>
                    {artwork.originalPrice && (
                      <p className="text-muted-foreground text-sm line-through">${artwork.originalPrice}</p>
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
          ))}
        </div>

        {filteredArtworks.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">No artworks found matching your criteria.</div>
        )}
      </div>
    </section>
  );
}
