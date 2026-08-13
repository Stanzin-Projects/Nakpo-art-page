import { Link } from 'react-router-dom';

export default function ArtCard({ artwork }) {
  const imageUrl = artwork.imageUrl?.startsWith('http')
    ? artwork.imageUrl
    : (artwork.imageUrl || '');

  return (
    <Link
      to={`/gallery/${artwork._id}`}
      className="group block overflow-hidden rounded-lg bg-stone/5 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2"
    >
      <div className="aspect-[4/5] overflow-hidden bg-stone/10">
        <img
          src={imageUrl}
          alt={artwork.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <h3 className="font-serif text-lg text-ink group-hover:text-gold transition-colors">
          {artwork.title}
        </h3>
        {artwork.year && (
          <p className="text-sm text-stone mt-1">{artwork.year}</p>
        )}
      </div>
    </Link>
  );
}
