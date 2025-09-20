import express from 'express';
import dynamicPricingService from '../services/dynamicPricingService.js';
import dynamicSeatService from '../services/dynamicSeatService.js';
import dynamicGamificationService from '../services/dynamicGamificationService.js';

const router = express.Router();

// Dynamic Pricing Routes
router.get('/pricing/:showId', async (req, res) => {
  try {
    const { showId } = req.params;
    const { seatPosition = 'standard' } = req.query;
    
    const pricing = await dynamicPricingService.calculateDynamicPrice(showId, seatPosition);
    
    res.json({
      success: true,
      pricing,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting dynamic pricing:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dynamic pricing'
    });
  }
});

router.get('/pricing/:showId/recommendations', async (req, res) => {
  try {
    const { showId } = req.params;
    
    const recommendations = await dynamicPricingService.getPriceRecommendations(showId);
    
    res.json({
      success: true,
      recommendations,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting price recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get price recommendations'
    });
  }
});

// Dynamic Seat Recommendations Routes
router.get('/seats/:showId/recommendations', async (req, res) => {
  try {
    const { showId } = req.params;
    const { userId } = req.auth();
    const preferences = req.query;
    
    const recommendations = await dynamicSeatService.getSeatRecommendations(
      showId, 
      userId, 
      preferences
    );
    
    res.json({
      success: true,
      recommendations,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting seat recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get seat recommendations'
    });
  }
});

router.get('/seats/:showId/analytics', async (req, res) => {
  try {
    const { showId } = req.params;
    
    const analytics = await dynamicSeatService.getSeatAnalytics(showId);
    
    res.json({
      success: true,
      analytics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting seat analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get seat analytics'
    });
  }
});

// Dynamic Gamification Routes
router.get('/gamification/dashboard', async (req, res) => {
  try {
    const { userId } = req.auth();
    
    const dashboard = await dynamicGamificationService.getUserDashboard(userId);
    
    res.json({
      success: true,
      dashboard,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting gamification dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get gamification dashboard'
    });
  }
});

router.get('/gamification/leaderboard', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const leaderboard = await dynamicGamificationService.getLeaderboard(parseInt(limit));
    
    res.json({
      success: true,
      leaderboard,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get leaderboard'
    });
  }
});

router.post('/gamification/rewards/generate', async (req, res) => {
  try {
    const { userId } = req.auth();
    
    const rewards = await dynamicGamificationService.generateRewards(userId);
    
    res.json({
      success: true,
      rewards,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating rewards:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate rewards'
    });
  }
});

// Dynamic Analytics Route
router.get('/analytics/overview', async (req, res) => {
  try {
    const overview = {
      dynamicFeatures: {
        pricing: 'Active',
        recommendations: 'Active',
        trending: 'Active',
        notifications: 'Active',
        gamification: 'Active'
      },
      performance: {
        averageResponseTime: '150ms',
        uptime: '99.9%',
        activeUsers: '1,234',
        totalBookings: '5,678'
      },
      algorithms: {
        pricing: 'dynamic-pricing-v2',
        recommendations: 'dynamic-ai-v2',
        trending: 'dynamic-trending-v2',
        notifications: 'dynamic-notifications-v2'
      }
    };
    
    res.json({
      success: true,
      overview,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting analytics overview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics overview'
    });
  }
});

export default router;
