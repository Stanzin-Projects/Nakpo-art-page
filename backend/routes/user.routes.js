import express from 'express';
import mongoose from 'mongoose';
import { requireAuth } from '../middleware/auth.js';
import Artwork from '../models/Artwork.model.js';

const router = express.Router();
router.use(requireAuth);

// ---- Saved addresses ----
router.get('/addresses', (req, res) => {
  res.json(req.user.addresses || []);
});

router.post('/addresses', async (req, res) => {
  try {
    const { label, line1, line2, city, state, zip, country, isDefault } = req.body;
    if (!line1) return res.status(400).json({ message: 'Address line 1 is required' });
    if (isDefault) {
      req.user.addresses.forEach((a) => {
        a.isDefault = false;
      });
    }
    req.user.addresses.push({ label, line1, line2, city, state, zip, country, isDefault: !!isDefault });
    await req.user.save();
    res.status(201).json(req.user.addresses);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/addresses/:id', async (req, res) => {
  try {
    const addr = req.user.addresses.id(req.params.id);
    if (!addr) return res.status(404).json({ message: 'Address not found' });
    const { label, line1, line2, city, state, zip, country, isDefault } = req.body;
    if (isDefault) {
      req.user.addresses.forEach((a) => {
        a.isDefault = false;
      });
    }
    Object.assign(addr, { label, line1, line2, city, state, zip, country, isDefault: !!isDefault });
    await req.user.save();
    res.json(req.user.addresses);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/addresses/:id', async (req, res) => {
  try {
    req.user.addresses.id(req.params.id).deleteOne();
    await req.user.save();
    res.json(req.user.addresses);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ---- Favorites / wishlist ----
router.get('/favorites', async (req, res) => {
  const favorites = await Artwork.find({ _id: { $in: req.user.favorites || [] } });
  res.json(favorites);
});

router.put('/favorites/:artworkId', async (req, res) => {
  try {
    const id = req.params.artworkId;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid artwork id' });
    const index = req.user.favorites.findIndex((f) => String(f) === String(id));
    if (index >= 0) req.user.favorites.splice(index, 1);
    else req.user.favorites.push(id);
    await req.user.save();
    const favorites = await Artwork.find({ _id: { $in: req.user.favorites } });
    res.json({ favorites, favoriteIds: req.user.favorites.map(String) });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
