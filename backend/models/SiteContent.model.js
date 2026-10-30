import mongoose from 'mongoose';

// Single-document store for the editable homepage sections (hero, gallery, about, contact).
const siteContentSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'main', unique: true },
    hero: {
      title: String,
      subtitle: String,
      description: String,
      ctaText: String,
      backgroundImage: String,
    },
    gallery: {
      title: String,
      description: String,
    },
    about: {
      title: String,
      subtitle: String,
      description: String,
      image: String,
      stats: [{ value: String, label: String }],
    },
    // Store-wide campaign (eg. "Diwali Sale — 40% off").
    sale: {
      active: { type: Boolean, default: false },
      label: String,
      percent: Number,
      endsAt: String,
    },
    contact: {
      title: String,
      description: String,
      email: String,
      phone: String,
      address: String,
      website: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model('SiteContent', siteContentSchema);
