import { useState } from 'react';
import { X, Heart, ShoppingCart, Palette } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';

const BACKGROUND_OPTIONS = [
  { name: 'Pure White', color: '#ffffff', value: 'pure-white' },
  { name: 'Off White', color: '#fefefe', value: 'off-white' },
  { name: 'Cream', color: '#fdfcf8', value: 'cream' },
  { name: 'Warm White', color: '#faf9f6', value: 'warm-white' },
  { name: 'Pearl Gray', color: '#f8f9fa', value: 'pearl-gray' },
  { name: 'Linen', color: '#faf0e6', value: 'linen' },
  { name: 'Navy Blue', color: '#1e3a5f', value: 'navy-blue' },
  { name: 'Charcoal', color: '#374151', value: 'charcoal' },
  { name: 'Deep Black', color: '#000000', value: 'deep-black' },
];

export function ArtworkDetailModal({ artwork, isOpen, onClose, onAddToCart, isFavorite, onToggleFavorite }) {
  const [selectedBackground, setSelectedBackground] = useState('pure-white');

  if (!artwork || !isOpen) return null;

  const imageSrc = artwork.image || artwork.imageUrl;
  const bgColor = BACKGROUND_OPTIONS.find((o) => o.value === selectedBackground)?.color || '#ffffff';

  return (
    <>
      <div className="fixed inset-0 bg-black/80 z-50" onClick={onClose} aria-hidden />
      <div className="fixed inset-4 md:inset-8 lg:inset-16 z-50 overflow-auto bg-background rounded-lg shadow-2xl flex flex-col max-w-6xl mx-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl font-medium text-foreground">{artwork.title}</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleFavorite}
              className="p-2 hover:bg-muted rounded-full"
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
            </button>
            <button type="button" onClick={onClose} className="p-2 hover:bg-muted rounded-full">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto grid lg:grid-cols-2 min-h-0">
          <div className="p-6 space-y-4 bg-muted/20">
            <div className="bg-white/95 rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Palette className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Preview Background</span>
              </div>
              <div className="grid grid-cols-6 gap-2">
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
              className="w-full aspect-square flex items-center justify-center p-8 rounded-lg transition-colors"
              style={{ backgroundColor: bgColor }}
            >
              <ImageWithFallback src={imageSrc} alt={artwork.title} className="max-w-full max-h-full object-contain" />
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <p className="text-3xl font-medium text-foreground">${artwork.price ?? 0}</p>
              <div className="flex gap-2 mt-2">
                <span className="rounded-md bg-primary text-primary-foreground px-2 py-0.5 text-xs">
                  {artwork.isOriginal ? 'Original' : 'Print'}
                </span>
                <span className="rounded-md border border-border px-2 py-0.5 text-xs">{artwork.category}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onAddToCart(artwork)}
              className="w-full h-12 rounded-md bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 hover:opacity-90"
            >
              <ShoppingCart className="h-5 w-5" />
              Add to Cart
            </button>

            <div className="border-t border-border pt-4">
              <h3 className="font-medium mb-3 text-foreground">Description</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {artwork.description}. This piece explores the intersection of color and emotion, creating a visual dialogue that speaks to the viewer's inner experience.
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
      </div>
    </>
  );
}
