/**
 * Showcase-only marquee of featured art images.
 * Scrolls slowly left → right. No click navigation — pure display.
 */
export function ImageMarquee() {
  const images = [
    { src: '/caravan.webp', alt: 'Mountain Caravan — Pen & Ink Artwork' },
    { src: '/yak.webp', alt: 'Yak — Pen & Ink Artwork' },
  ];

  // Duplicate enough times for a seamless loop
  const track = [...images, ...images, ...images, ...images, ...images, ...images];

  return (
    <div className="image-marquee relative overflow-hidden py-6">
      <div className="image-marquee-track flex w-max gap-4 items-center">
        {track.map((img, i) => (
          <div key={i} className="shrink-0 w-64 sm:w-80 h-64 sm:h-80 flex items-center justify-center cursor-default">
            <img
              src={img.src}
              alt={img.alt}
              className="max-w-full max-h-full object-contain"
              draggable={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
