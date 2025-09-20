import express from "express";
import { getFavorites, getUserBookings, updateFavorite, followUser, unfollowUser, getFollowing } from "../controllers/userController.js";
import { getUserStats } from "../controllers/gamificationController.js";

const userRouter = express.Router();

userRouter.get('/bookings', getUserBookings)
userRouter.post('/update-favorite', updateFavorite)
userRouter.get('/favorites', getFavorites)
userRouter.post('/follow/:userId', followUser)
userRouter.delete('/follow/:userId', unfollowUser)
userRouter.get('/following', getFollowing)
userRouter.get('/gamification', getUserStats)

// Pricing alerts endpoints
userRouter.get('/pricing-alerts', async (req, res) => {
  try {
    // Mock response for now
    res.json({
      success: true,
      alerts: []
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

userRouter.post('/pricing-alerts', async (req, res) => {
  try {
    // Mock response for now
    res.json({
      success: true,
      alert: { id: Date.now(), ...req.body }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

userRouter.put('/pricing-alerts/:alertId', async (req, res) => {
  try {
    // Mock response for now
    res.json({
      success: true,
      message: 'Alert updated'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

userRouter.delete('/pricing-alerts/:alertId', async (req, res) => {
  try {
    // Mock response for now
    res.json({
      success: true,
      message: 'Alert deleted'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

userRouter.post('/alert-settings', async (req, res) => {
  try {
    // Mock response for now
    res.json({
      success: true,
      message: 'Settings updated'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default userRouter;