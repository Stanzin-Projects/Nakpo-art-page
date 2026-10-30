import Artwork from '../models/Artwork.model.js';
import Review from '../models/Review.model.js';

// Form-data (file uploads) arrives as strings — coerce fields back to numbers/booleans.
function coerceFields(body) {
  const out = { ...body };
  for (const key of ['price', 'originalPrice', 'discount', 'year', 'order']) {
    if (out[key] !== undefined && out[key] !== null && out[key] !== '') out[key] = Number(out[key]);
  }
  for (const key of ['isFeatured', 'isOriginal']) {
    if (out[key] !== undefined) out[key] = out[key] === true || out[key] === 'true';
  }
  return out;
}

async function attachRatings(artworks) {
  const ids = artworks.map((a) => a._id);
  const ratings = await Review.aggregate([
    { $match: { artwork: { $in: ids } } },
    { $group: { _id: '$artwork', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const map = new Map(ratings.map((r) => [String(r._id), r]));
  return artworks.map((a) => {
    const r = map.get(String(a._id));
    return {
      ...a.toObject(),
      ratingAvg: r ? Math.round(r.avg * 10) / 10 : 0,
      ratingCount: r ? r.count : 0,
    };
  });
}

export const getArtworks = async (req, res) => {
  try {
    const { category, featured } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (featured === 'true') filter.isFeatured = true;

    const artworks = await Artwork.find(filter).sort({ order: 1, createdAt: -1 });
    res.json(await attachRatings(artworks));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getArtworkById = async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) return res.status(404).json({ message: 'Artwork not found' });
    const [withRating] = await attachRatings([artwork]);
    res.json(withRating);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createArtwork = async (req, res) => {
  try {
    const data = coerceFields(req.body);
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : data.imageUrl;
    if (!imageUrl) return res.status(400).json({ message: 'An image is required (upload a file or provide an image URL)' });
    const artwork = await Artwork.create({ ...data, imageUrl });
    res.status(201).json(artwork);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateArtwork = async (req, res) => {
  try {
    const data = coerceFields(req.body);
    if (req.file) data.imageUrl = `/uploads/${req.file.filename}`;
    const update = { $set: data };
    // A manual price edit wins over a running sale: drop the sale baseline so
    // ending the sale later cannot overwrite the new price.
    if (data.price !== undefined) update.$unset = { priceBeforeSale: '' };
    const artwork = await Artwork.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
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
