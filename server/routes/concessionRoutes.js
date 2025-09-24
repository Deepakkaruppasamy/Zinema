import express from 'express';
import { listItems, adminListItems, createItem, updateItem, deleteItem, createOrder, myOrders, updateOrderStatus } from '../controllers/concessionController.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public / user routes
router.get('/items', listItems);
router.post('/orders', createOrder);
router.get('/orders/me', myOrders);

// Admin routes
router.get('/admin/items', protectAdmin, adminListItems);
router.post('/admin/items', protectAdmin, createItem);
router.put('/admin/items/:id', protectAdmin, updateItem);
router.delete('/admin/items/:id', protectAdmin, deleteItem);
router.patch('/admin/orders/:id/status', protectAdmin, updateOrderStatus);

export default router;


