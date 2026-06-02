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

router.get('/user', protectAdmin, getUserStats);

router.get('/badges', getAvailableBadges);

router.get('/leaderboard', getLeaderboard);

router.get('/rewards', protectAdmin, getRewards);

router.post('/rewards/:rewardId/claim', protectAdmin, claimReward);

export default router;
