import express from 'express';
import { protectAdmin } from '../middleware/auth.js';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  updateWishlistItem,
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  getReminderStats
} from '../controllers/wishlistController.js';

const router = express.Router();

// Wishlist routes
router.get('/wishlist', protectAdmin, getWishlist);
router.post('/wishlist', protectAdmin, addToWishlist);
router.delete('/wishlist/:movieId', protectAdmin, removeFromWishlist);
router.put('/wishlist/:movieId', protectAdmin, updateWishlistItem);

// Reminder routes
router.get('/reminders', protectAdmin, getReminders);
router.post('/reminders', protectAdmin, createReminder);
router.put('/reminders/:reminderId', protectAdmin, updateReminder);
router.delete('/reminders/:reminderId', protectAdmin, deleteReminder);
router.get('/reminders/stats', protectAdmin, getReminderStats);

export default router;
