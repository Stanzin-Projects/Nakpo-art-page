import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getArtworkById } from '../api/artwork.api';

export default function ArtworkDetail() {
  const { id } = useParams();
  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getArtworkById(id)
      .then((res) => setArtwork(res.data))
      .catch(() => setError('Work not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-center py-20 text-stone">Loading…</p>;
  if (error || !artwork) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-stone mb-4">{error || 'Work not found.'}</p>
        <Link to="/gallery" className="text-gold hover:underline">Back to gallery</Link>
      </div>
    );
  }

  const imageUrl = artwork.imageUrl?.startsWith('http') ? artwork.imageUrl : artwork.imageUrl;

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <Link to="/gallery" className="inline-block text-stone hover:text-gold text-sm mb-8">
        ← Back to gallery
      </Link>
      <div className="grid md:grid-cols-2 gap-10 items-start">
        <div className="aspect-[4/5] rounded-lg overflow-hidden bg-stone/10">
          <img
            src={imageUrl}
            alt={artwork.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h1 className="font-serif text-3xl text-ink mb-2">{artwork.title}</h1>
          {artwork.year && <p className="text-stone mb-4">{artwork.year}</p>}
          {artwork.description && (
            <p className="text-ink/90 leading-relaxed whitespace-pre-line">
              {artwork.description}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
