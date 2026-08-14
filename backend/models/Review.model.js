import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    artwork: { type: mongoose.Schema.Types.ObjectId, ref: 'Artwork', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

// one review per user per artwork
reviewSchema.index({ artwork: 1, user: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);
