import express from 'express';
import mongoose from 'mongoose';
import Review from '../models/Review.model.js';
import Artwork from '../models/Artwork.model.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/artworks/:id/reviews', async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid artwork id' });
    const reviews = await Review.find({ artwork: id }).sort({ createdAt: -1 }).limit(50);
    const agg = await Review.aggregate([
      { $match: { artwork: new mongoose.Types.ObjectId(id) } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    res.json({
      reviews,
      average: agg[0] ? Math.round(agg[0].avg * 10) / 10 : 0,
      count: agg[0] ? agg[0].count : 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/artworks/:id/reviews', requireAuth, async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid artwork id' });
    const artwork = await Artwork.findById(id);
    if (!artwork) return res.status(404).json({ message: 'Artwork not found' });
    const rating = Number(req.body.rating);
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    const review = await Review.findOneAndUpdate(
      { artwork: id, user: req.user._id },
      { $set: { name: req.user.name, rating, comment: String(req.body.comment || '').trim() } },
      { upsert: true, new: true }
    );
    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
