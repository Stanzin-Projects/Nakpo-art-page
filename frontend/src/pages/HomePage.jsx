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
    backgroundImage: '/artworks/art1.webp',
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

export default function HomePage() {
  const [artworks, setArtworks] = useState([]);
  const [siteContent, setSiteContent] = useState(defaultSiteContent);

  useEffect(() => {
    getArtworks()
      .then((res) => setArtworks((res.data || []).map(normalizeArtwork)))
      .catch(() => setArtworks([]));
    getSiteContent()
      .then((res) => setSiteContent(res.data))
      .catch(() => {});
  }, []);

  return (
    <div className="bg-white">
      <HeroSection siteContent={siteContent} artworks={artworks} />
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
