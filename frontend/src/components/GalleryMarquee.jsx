import { ImageWithFallback } from './ImageWithFallback';

/**
 * Showcase-only marquee of gallery artworks.
 * Scrolls slowly left → right. No click navigation, no price/text — pure display.
 */
export function GalleryMarquee({ artworks = [] }) {
  if (artworks.length === 0) return null;

  const imageUrl = (art) => art.image || art.imageUrl;

  // Repeat the list enough times so even a short collection fills the width.
  const copies = Math.max(2, Math.ceil(8 / artworks.length));
  const items = Array.from({ length: copies }, () => artworks).flat();
  const track = [...items, ...items];

  return (
    <div className="gallery-marquee relative mb-14 overflow-hidden py-6">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 sm:w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 sm:w-24 bg-gradient-to-l from-background to-transparent" />

      <div className="gallery-marquee-track flex w-max gap-4">
        {track.map((art, i) => {
          const artId = art.id || art._id;
          return (
            <div
              key={`${artId}-${i}`}
              className="shrink-0 w-64 sm:w-80 cursor-default"
            >
              <ImageWithFallback
                src={imageUrl(art)}
                alt={art.title}
                className="aspect-square w-full object-contain"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
