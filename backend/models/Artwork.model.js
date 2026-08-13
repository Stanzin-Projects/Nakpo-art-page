import mongoose from 'mongoose';

const artworkSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    imageUrl: { type: String, required: true },
    category: { type: String, default: 'general' },
    year: { type: Number },
    order: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    price: { type: Number, default: 0 },
    originalPrice: { type: Number },
    discount: { type: Number },
    dimensions: { type: String, default: '' },
    medium: { type: String, default: '' },
    isOriginal: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Artwork', artworkSchema);
