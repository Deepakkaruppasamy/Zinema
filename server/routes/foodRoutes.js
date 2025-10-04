import express from 'express';
import { 
  getFoodItemsForTheater, 
  createFoodOrder, 
  getMyFoodOrders, 
  cancelFoodOrder,
  foodOrderPaymentWebhook
} from '../controllers/foodController.js';

const router = express.Router();

// Public routes
router.get('/:theaterId', getFoodItemsForTheater);

// Authenticated routes
router.post('/order', createFoodOrder);
router.get('/orders/my', getMyFoodOrders);
router.post('/orders/:id/cancel', cancelFoodOrder);

// Webhook route (must be before express.json() middleware)
router.post('/webhook', express.raw({type: 'application/json'}), foodOrderPaymentWebhook);

export default router;
