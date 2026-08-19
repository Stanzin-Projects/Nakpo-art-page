import express from 'express';
import {
  getArtworks,
  getArtworkById,
  createArtwork,
  updateArtwork,
  deleteArtwork,
} from '../controllers/artwork.controller.js';
import { upload } from '../middleware/upload.middleware.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getArtworks);
router.get('/:id', getArtworkById);
// Artwork management is admin-only: creating, editing and deleting change the shop.
router.post('/', requireAdmin, upload.single('image'), createArtwork);
router.put('/:id', requireAdmin, upload.single('image'), updateArtwork);
router.delete('/:id', requireAdmin, deleteArtwork);

export default router;
