import express from 'express';
import { protectAdmin } from '../middleware/auth.js';
import {
  getPricingAlerts,
  createPricingAlert,
  updatePricingAlert,
  deletePricingAlert,
  getPriceHistory,
  getAlertStats
} from '../controllers/pricingAlertController.js';

const router = express.Router();

// Pricing alert routes
router.get('/pricing-alerts', protectAdmin, getPricingAlerts);
router.post('/pricing-alerts', protectAdmin, createPricingAlert);
router.put('/pricing-alerts/:alertId', protectAdmin, updatePricingAlert);
router.delete('/pricing-alerts/:alertId', protectAdmin, deletePricingAlert);
router.get('/pricing/history', getPriceHistory);
router.get('/pricing-alerts/stats', protectAdmin, getAlertStats);

export default router;
