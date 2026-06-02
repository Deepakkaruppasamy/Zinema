import express from 'express';
import { 
  getFoodItemsForShow, 
  createFoodOrder, 
  getMyFoodOrders, 
  cancelFoodOrder,
  foodOrderPaymentWebhook
} from '../controllers/foodController.js';

const router = express.Router();

router.get('/:showId', getFoodItemsForShow);

router.post('/order', createFoodOrder);
router.get('/orders/my', getMyFoodOrders);
router.post('/orders/:id/cancel', cancelFoodOrder);

router.post('/webhook', express.raw({type: 'application/json'}), foodOrderPaymentWebhook);

export default router;
