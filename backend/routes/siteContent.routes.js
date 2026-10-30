import express from 'express';
import SiteContent from '../models/SiteContent.model.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

export const DEFAULT_CONTENT = {
  hero: {
    title: 'Art that Speaks to Your Soul',
    subtitle: 'Discover unique artworks that transform spaces',
    description:
      'Explore our curated collection of original paintings, limited edition prints, and commissioned artworks.',
    ctaText: 'Explore Gallery',
    backgroundImage: '/artworks/art1.webp',
  },
  gallery: {
    title: 'Art Gallery',
    description:
      'Explore our collection of original artworks and limited edition prints. Each piece is carefully crafted to bring beauty and meaning to your space.',
  },
  about: {
    title: 'About the Artist',
    subtitle: 'Creating meaningful connections through art',
    description:
      'With over a decade of experience in contemporary art, I create pieces that bridge the gap between traditional techniques and modern expression.',
    image:
      'https://images.cdn-files-a.com/uploads/7871374/2000_644a7ebe3625f_filter_645ca89d0848f.png',
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

router.get('/', async (req, res) => {
  try {
    let doc = await SiteContent.findOne({ key: 'main' });
    if (!doc) {
      doc = await SiteContent.create({ key: 'main', ...DEFAULT_CONTENT });
    }
    res.json(doc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Editing the site sections is admin-only.
router.put('/', requireAdmin, async (req, res) => {
  try {
    // `sale` is intentionally excluded: it is only written by the apply/clear
    // endpoints, so the banner can never advertise a sale whose prices were
    // not actually applied.
    const allowed = ['hero', 'gallery', 'about', 'contact'];
    const patch = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) patch[key] = req.body[key];
    }
    const doc = await SiteContent.findOneAndUpdate(
      { key: 'main' },
      { $set: patch },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(doc);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
