import { useState, useEffect } from 'react';
import { HeroSection } from '../components/HeroSection';
import { ArtGallery } from '../components/ArtGallery';
import { AboutSection } from '../components/AboutSection';
import { ContactSection } from '../components/ContactSection';
import { ImageMarquee } from '../components/ImageMarquee';
import { getArtworks } from '../api/artwork.api';
import { getSiteContent } from '../api/siteContent.api';

const defaultSiteContent = {
  general: {
    siteName: 'ARTBYLOPSANG',
    logo: 'https://images.cdn-files-a.com/uploads/7871374/400_filter_nobg_661f5231a6a43.png',
    tagline: 'Creating meaningful art that transforms spaces and touches hearts',
  },
  hero: {
    title: 'Art that Speaks to Your Soul',
    subtitle: 'Discover unique artworks that transform spaces',
    description:
      'Explore our curated collection of original paintings, limited edition prints, and commissioned artworks.',
    ctaText: 'Explore Gallery',
    backgroundImage: 'https://images.cdn-files-a.com/uploads/7871374/2000_644d45ca0954b.png',
  },
  about: {
    title: 'About the Artist',
    subtitle: 'Creating meaningful connections through art',
    description:
      'With over a decade of experience in contemporary art, I create pieces that bridge the gap between traditional techniques and modern expression.',
    image: 'https://images.cdn-files-a.com/uploads/7871374/2000_644a7ebe3625f_filter_645ca89d0848f.png',
    stats: [
      { value: '100+', label: 'Artworks Created' },
      { value: '50+', label: 'Happy Collectors' },
      { value: '5+', label: 'Years Experience' },
      { value: '10+', label: 'Exhibitions' },
    ],
  },
  contact: {
    title: 'Get in Touch',
    description: "Interested in commissioning a piece or learning more? I'd love to hear from you.",
    email: 'artist@artbylopsang.com',
    phone: '+1 (555) 123-4567',
    address: '123 Art District, Creative City, NY 10001',
    website: 'https://artbylopsang.com',
  },
};

const caravanArt = {
  imageUrl: '/caravan.webp',
  image: '/caravan.webp',
  title: 'Mountain Caravan',
  category: 'Pen & Ink',
  medium: 'Ink on Paper',
  dimensions: '12 × 16 inches',
  description: 'A detailed pen and ink drawing depicting a caravan of yaks traversing through majestic mountain landscapes.',
  isOriginal: true,
  ratingAvg: 4.8,
  ratingCount: 12,
};

const yakArt = {
  imageUrl: '/yak.webp',
  image: '/yak.webp',
  title: 'The Yak',
  category: 'Pen & Ink',
  medium: 'Ink on Paper',
  dimensions: '12 × 16 inches',
  description: 'A striking portrait of a yak rendered in fine pen and ink, capturing the spirit of the Himalayan highlands.',
  isOriginal: true,
  ratingAvg: 4.9,
  ratingCount: 8,
};

const featuredArtworks = [
  { ...caravanArt, id: 'featured-caravan-1', price: 12500, originalPrice: 15000, discount: 17 },
  { ...yakArt, id: 'featured-yak-1', price: 9800, originalPrice: 12000, discount: 18 },
  { ...caravanArt, id: 'featured-caravan-2', price: 12500, originalPrice: 15000, discount: 17 },
  { ...yakArt, id: 'featured-yak-2', price: 9800, originalPrice: 12000, discount: 18 },
  { ...caravanArt, id: 'featured-caravan-3', price: 12500, originalPrice: 15000, discount: 17 },
  { ...yakArt, id: 'featured-yak-3', price: 9800, originalPrice: 12000, discount: 18 },
  { ...caravanArt, id: 'featured-caravan-4', price: 12500, originalPrice: 15000, discount: 17 },
  { ...yakArt, id: 'featured-yak-4', price: 9800, originalPrice: 12000, discount: 18 },
  { ...caravanArt, id: 'featured-caravan-5', price: 12500, originalPrice: 15000, discount: 17 },
  { ...yakArt, id: 'featured-yak-5', price: 9800, originalPrice: 12000, discount: 18 },
  { ...caravanArt, id: 'featured-caravan-6', price: 12500, originalPrice: 15000, discount: 17 },
  { ...yakArt, id: 'featured-yak-6', price: 9800, originalPrice: 12000, discount: 18 },
  { ...caravanArt, id: 'featured-caravan-7', price: 12500, originalPrice: 15000, discount: 17 },
  { ...yakArt, id: 'featured-yak-7', price: 9800, originalPrice: 12000, discount: 18 },
  { ...caravanArt, id: 'featured-caravan-8', price: 12500, originalPrice: 15000, discount: 17 },
  { ...yakArt, id: 'featured-yak-8', price: 9800, originalPrice: 12000, discount: 18 },
  { ...caravanArt, id: 'featured-caravan-9', price: 12500, originalPrice: 15000, discount: 17 },
  { ...yakArt, id: 'featured-yak-9', price: 9800, originalPrice: 12000, discount: 18 },
  { ...caravanArt, id: 'featured-caravan-10', price: 12500, originalPrice: 15000, discount: 17 },
  { ...yakArt, id: 'featured-yak-10', price: 9800, originalPrice: 12000, discount: 18 },
];

export default function HomePage() {
  const [artworks, setArtworks] = useState([]);
  const [siteContent, setSiteContent] = useState(defaultSiteContent);

  useEffect(() => {
    getArtworks()
      .then((res) => {
        const apiArtworks = (res.data || []).map(normalizeArtwork);
        const apiIds = new Set(apiArtworks.map((a) => a.id));
        const newFeatured = featuredArtworks.filter((f) => !apiIds.has(f.id));
        setArtworks([...newFeatured, ...apiArtworks]);
      })
      .catch(() => setArtworks(featuredArtworks));
    getSiteContent()
      .then((res) => setSiteContent(res.data))
      .catch(() => {});
  }, []);

  return (
    <div className="bg-white">
      <HeroSection siteContent={siteContent} />
      <ImageMarquee />
      <ArtGallery artworks={artworks} siteContent={siteContent} />
      <AboutSection siteContent={siteContent} />
      <ContactSection siteContent={siteContent} />
    </div>
  );
}

function normalizeArtwork(a) {
  return {
    ...a,
    id: a._id || a.id,
    image: a.imageUrl || a.image,
  };
}
