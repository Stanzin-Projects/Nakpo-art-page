import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFeaturedArtworks } from '../api/artwork.api';
import ArtCard from '../components/ArtCard';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFeaturedArtworks()
      .then((res) => setFeatured(res.data))
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="relative min-h-[70vh] flex items-center justify-center px-4 text-center bg-stone/5">
        <div>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-ink mb-4">
            Lopsang Rinchen
          </h1>
          <p className="text-stone text-lg max-w-xl mx-auto mb-8">
            Art that bridges tradition and contemporary expression.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/gallery"
              className="inline-block px-6 py-3 bg-ink text-cream rounded-sm uppercase tracking-wider text-sm font-medium hover:bg-gold transition-colors"
            >
              View Gallery
            </Link>
            <Link
              to="/about"
              className="inline-block px-6 py-3 border border-ink text-ink rounded-sm uppercase tracking-wider text-sm font-medium hover:bg-ink hover:text-cream transition-colors"
            >
              About
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="font-serif text-2xl text-ink mb-8 text-center">Featured Work</h2>
        {loading ? (
          <p className="text-center text-stone">Loading…</p>
        ) : featured.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featured.map((art) => (
              <ArtCard key={art._id} artwork={art} />
            ))}
          </div>
        ) : (
          <p className="text-center text-stone">
            No featured works yet.{' '}
            <Link to="/gallery" className="text-gold hover:underline">Browse gallery</Link>.
          </p>
        )}
        <div className="text-center mt-12">
          <Link to="/gallery" className="text-gold font-medium hover:underline">
            See full gallery →
          </Link>
        </div>
      </section>
    </div>
  );
}
