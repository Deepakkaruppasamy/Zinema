
import { Router } from 'express';
import { deepaiChat, deepaiAssistant, checkAIServiceHealth } from '../controllers/deepaiController.js';

const router = Router();

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    const healthStatus = await checkAIServiceHealth();
    
    if (healthStatus.healthy) {
      return res.status(200).json({
        status: 'healthy',
        service: 'DeepAI',
        model: healthStatus.model,
        timestamp: healthStatus.timestamp,
        message: 'DeepAI service is operational and ready to handle requests'
      });
    } else {
      return res.status(503).json({
        status: 'unhealthy',
        service: 'DeepAI',
        error: healthStatus.error,
        timestamp: healthStatus.timestamp,
        message: 'DeepAI service is not available',
        action: 'Please check your GEMINI_API_KEY and ensure it has sufficient quota'
      });
    }
  } catch (error) {
    console.error('Health check failed:', error);
    return res.status(500).json({
      status: 'error',
      service: 'DeepAI',
      timestamp: new Date().toISOString(),
      message: 'Failed to check DeepAI service health',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Add error handling middleware for DeepAI routes
router.use((req, res, next) => {
  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({
      status: 'service_unavailable',
      message: 'DeepAI service is not properly configured. Please check server logs.'
    });
  }
  next();
});

// API endpoints
router.post('/chat', deepaiChat);
router.post('/assistant', deepaiAssistant);

export default router;


