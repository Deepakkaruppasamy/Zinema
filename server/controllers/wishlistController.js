import Wishlist from '../models/Wishlist.js';
import Reminder from '../models/Reminder.js';
import Movie from '../models/Movie.js';

// Get user wishlist
export const getWishlist = async (req, res) => {
  try {
    const { userId } = req.user;
    
    const wishlist = await Wishlist.find({ userId }).sort({ addedAt: -1 });
    
    res.json({
      success: true,
      wishlist
    });
  } catch (error) {
    console.error('Error getting wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get wishlist'
    });
  }
};

// Add to wishlist
export const addToWishlist = async (req, res) => {
  try {
    const { userId } = req.user;
    const { movieId, movieTitle, moviePoster, genre, rating, priority, notes, tags } = req.body;
    
    // Check if already in wishlist
    const existing = await Wishlist.findOne({ userId, movieId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Movie already in wishlist'
      });
    }
    
    const wishlistItem = new Wishlist({
      userId,
      movieId,
      movieTitle,
      moviePoster,
      genre,
      rating,
      priority,
      notes,
      tags
    });
    
    await wishlistItem.save();
    
    res.json({
      success: true,
      message: 'Added to wishlist',
      item: wishlistItem
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add to wishlist'
    });
  }
};

// Remove from wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const { userId } = req.user;
    const { movieId } = req.params;
    
    const result = await Wishlist.findOneAndDelete({ userId, movieId });
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in wishlist'
      });
    }
    
    res.json({
      success: true,
      message: 'Removed from wishlist'
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove from wishlist'
    });
  }
};

// Update wishlist item
export const updateWishlistItem = async (req, res) => {
  try {
    const { userId } = req.user;
    const { movieId } = req.params;
    const updates = req.body;
    
    const wishlistItem = await Wishlist.findOneAndUpdate(
      { userId, movieId },
      updates,
      { new: true }
    );
    
    if (!wishlistItem) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in wishlist'
      });
    }
    
    res.json({
      success: true,
      message: 'Wishlist item updated',
      item: wishlistItem
    });
  } catch (error) {
    console.error('Error updating wishlist item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update wishlist item'
    });
  }
};

// Get user reminders
export const getReminders = async (req, res) => {
  try {
    const { userId } = req.user;
    
    const reminders = await Reminder.find({ userId }).sort({ reminderTime: 1 });
    
    res.json({
      success: true,
      reminders
    });
  } catch (error) {
    console.error('Error getting reminders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reminders'
    });
  }
};

// Create reminder
export const createReminder = async (req, res) => {
  try {
    const { userId } = req.user;
    const { movieId, movieTitle, reminderType, reminderTime, channel, message, metadata } = req.body;
    
    const reminder = new Reminder({
      userId,
      movieId,
      movieTitle,
      reminderType,
      reminderTime: new Date(reminderTime),
      channel: channel || 'email',
      message,
      metadata
    });
    
    await reminder.save();
    
    res.json({
      success: true,
      message: 'Reminder created',
      reminder
    });
  } catch (error) {
    console.error('Error creating reminder:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create reminder'
    });
  }
};

// Update reminder
export const updateReminder = async (req, res) => {
  try {
    const { userId } = req.user;
    const { reminderId } = req.params;
    const updates = req.body;
    
    const reminder = await Reminder.findOneAndUpdate(
      { _id: reminderId, userId },
      updates,
      { new: true }
    );
    
    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Reminder updated',
      reminder
    });
  } catch (error) {
    console.error('Error updating reminder:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update reminder'
    });
  }
};

// Delete reminder
export const deleteReminder = async (req, res) => {
  try {
    const { userId } = req.user;
    const { reminderId } = req.params;
    
    const result = await Reminder.findOneAndDelete({ _id: reminderId, userId });
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Reminder deleted'
    });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete reminder'
    });
  }
};

// Get reminder statistics
export const getReminderStats = async (req, res) => {
  try {
    const { userId } = req.user;
    
    const stats = await Reminder.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: ['$enabled', 1, 0] } },
          triggered: { $sum: { $cond: ['$triggered', 1, 0] } },
          byType: {
            $push: {
              type: '$reminderType',
              enabled: '$enabled',
              triggered: '$triggered'
            }
          }
        }
      }
    ]);
    
    const result = stats[0] || { total: 0, active: 0, triggered: 0, byType: [] };
    
    res.json({
      success: true,
      stats: result
    });
  } catch (error) {
    console.error('Error getting reminder stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reminder stats'
    });
  }
};
