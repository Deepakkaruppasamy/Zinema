import express from 'express';
import { protectAdmin } from '../middleware/auth.js';
import {
  getAIRecommendations,
  getSimilarMovies,
  getTrendingMovies,
  getNewReleases
} from '../controllers/aiRecommendationController.js';

const router = express.Router();

// AI recommendation routes
router.get('/ai-recommendations', protectAdmin, getAIRecommendations);
router.get('/similar/:movieId', getSimilarMovies);
router.get('/trending', getTrendingMovies);
router.get('/new-releases', getNewReleases);

export default router;
