import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { getFavorites, getFavoriteIds, addFavorite, removeFavorite } from '../controllers/favoriteController.js';

const router = express.Router();

router.get('/', authMiddleware, getFavorites);
router.get('/ids', authMiddleware, getFavoriteIds);
router.post('/:listingId', authMiddleware, addFavorite);
router.delete('/:listingId', authMiddleware, removeFavorite);

export default router;
