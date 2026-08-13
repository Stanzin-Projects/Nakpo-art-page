import { useEffect, useState } from 'react';
import { getArtworks } from '../api/artwork.api';
import ArtCard from '../components/ArtCard';

export default function Gallery() {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');

  useEffect(() => {
    const params = category ? { category } : {};
    getArtworks(params)
      .then((res) => setArtworks(res.data))
      .catch(() => setArtworks([]))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-serif text-3xl text-ink mb-2">Gallery</h1>
      <p className="text-stone mb-8">A selection of works.</p>

      {loading ? (
        <p className="text-center text-stone py-12">Loading…</p>
      ) : artworks.length === 0 ? (
        <p className="text-center text-stone py-12">No artworks yet. Check back soon.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {artworks.map((art) => (
            <ArtCard key={art._id} artwork={art} />
          ))}
        </div>
      )}
    </div>
  );
}
