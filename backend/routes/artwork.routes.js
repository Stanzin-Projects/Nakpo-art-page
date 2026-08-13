import express from 'express';
import {
  getArtworks,
  getArtworkById,
  createArtwork,
  updateArtwork,
  deleteArtwork,
} from '../controllers/artwork.controller.js';
import { upload } from '../middleware/upload.middleware.js';

const router = express.Router();

router.get('/', getArtworks);
router.get('/:id', getArtworkById);
router.post('/', upload.single('image'), createArtwork);
router.put('/:id', updateArtwork);
router.delete('/:id', deleteArtwork);

export default router;
