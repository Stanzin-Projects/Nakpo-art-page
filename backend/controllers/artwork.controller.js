import Artwork from '../models/Artwork.model.js';

export const getArtworks = async (req, res) => {
  try {
    const { category, featured } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (featured === 'true') filter.isFeatured = true;

    const artworks = await Artwork.find(filter).sort({ order: 1, createdAt: -1 });
    res.json(artworks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getArtworkById = async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) return res.status(404).json({ message: 'Artwork not found' });
    res.json(artwork);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createArtwork = async (req, res) => {
  try {
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl;
    const artwork = await Artwork.create({ ...req.body, imageUrl });
    res.status(201).json(artwork);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateArtwork = async (req, res) => {
  try {
    const artwork = await Artwork.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!artwork) return res.status(404).json({ message: 'Artwork not found' });
    res.json(artwork);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteArtwork = async (req, res) => {
  try {
    const artwork = await Artwork.findByIdAndDelete(req.params.id);
    if (!artwork) return res.status(404).json({ message: 'Artwork not found' });
    res.json({ message: 'Artwork deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
