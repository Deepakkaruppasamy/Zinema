import express from 'express';
import { protectAdmin } from '../middleware/auth.js';
import {
  getUserStats,
  getAvailableBadges,
  getLeaderboard,
  getRewards,
  claimReward
} from '../controllers/gamificationController.js';

const router = express.Router();

// Get user gamification stats
router.get('/user', protectAdmin, getUserStats);

// Get available badges
router.get('/badges', getAvailableBadges);

// Get leaderboard
router.get('/leaderboard', getLeaderboard);

// Get available rewards
router.get('/rewards', protectAdmin, getRewards);

// Claim reward
router.post('/rewards/:rewardId/claim', protectAdmin, claimReward);

export default router;
