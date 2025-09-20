import Notification from '../models/Notification.js';
import User from '../models/User.js';

// Get notifications for a user
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user?.userId || 'demo-user';
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    
    const query = { isActive: true };
    
    // Add target audience filter
    query.$or = [
      { targetAudience: 'all' },
      { targetAudience: 'premium', 'readBy.userId': { $ne: userId } },
      { targetAudience: 'specific', targetUsers: userId }
    ];
    
    if (unreadOnly === 'true') {
      query['readBy.userId'] = { $ne: userId };
    }
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('movieId', 'title poster_path')
      .lean();
    
    // Mark which notifications are read by this user
    const notificationsWithReadStatus = notifications.map(notification => ({
      ...notification,
      isRead: notification.readBy.some(read => read.userId === userId),
      readAt: notification.readBy.find(read => read.userId === userId)?.readAt
    }));
    
    const total = await Notification.countDocuments(query);
    
    res.json({
      success: true,
      notifications: notificationsWithReadStatus,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    
    // Return empty notifications on database timeout to prevent UI issues
    if (error.name === 'MongooseError' && error.message.includes('buffering timed out')) {
      return res.json({
        success: true,
        notifications: [],
        pagination: {
          current: parseInt(req.query.page || 1),
          pages: 0,
          total: 0
        }
      });
    }
    
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const userId = req.user?.userId || 'demo-user';
    const { notificationId } = req.params;
    
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    
    // Check if already read
    const alreadyRead = notification.readBy.some(read => read.userId === userId);
    if (!alreadyRead) {
      notification.readBy.push({
        userId,
        readAt: new Date()
      });
      await notification.save();
    }
    
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, message: 'Failed to mark notification as read' });
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user?.userId || 'demo-user';
    
    await Notification.updateMany(
      { 
        isActive: true,
        'readBy.userId': { $ne: userId }
      },
      {
        $push: {
          readBy: {
            userId,
            readAt: new Date()
          }
        }
      }
    );
    
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ success: false, message: 'Failed to mark all notifications as read' });
  }
};

// Create notification (Admin only)
export const createNotification = async (req, res) => {
  try {
    const {
      title,
      message,
      type = 'general',
      priority = 'medium',
      targetAudience = 'all',
      targetUsers = [],
      movieId,
      expiresAt
    } = req.body;
    
    const createdBy = req.user?.userId || 'admin';
    
    // Only include movieId if it's a valid non-empty string
    const notificationData = {
      title,
      message,
      type,
      priority,
      targetAudience,
      targetUsers,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdBy
    };
    
    // Only add movieId if it's provided and not empty
    if (movieId && movieId.trim() !== '') {
      notificationData.movieId = movieId;
    }
    
    const notification = new Notification(notificationData);
    
    await notification.save();
    
    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      notification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    
    // Provide more specific error messages
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({ success: false, message: 'Failed to create notification' });
  }
};

// Get all notifications (Admin only)
export const getAllNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, priority, isActive } = req.query;
    
    const query = {};
    if (type) query.type = type;
    if (priority) query.priority = priority;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('movieId', 'title poster_path')
      .lean();
    
    const total = await Notification.countDocuments(query);
    
    res.json({
      success: true,
      notifications,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching all notifications:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
};

// Update notification (Admin only)
export const updateNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const updateData = { ...req.body };
    
    // Handle empty movieId - remove it from updateData if empty
    if (updateData.movieId !== undefined && (updateData.movieId === '' || updateData.movieId === null)) {
      updateData.$unset = { movieId: 1 };
      delete updateData.movieId;
    }
    
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    
    res.json({
      success: true,
      message: 'Notification updated successfully',
      notification
    });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ success: false, message: 'Failed to update notification' });
  }
};

// Delete notification (Admin only)
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Notification.findByIdAndDelete(notificationId);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    
    res.json({ success: true, message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ success: false, message: 'Failed to delete notification' });
  }
};

// Get notification stats (Admin only)
export const getNotificationStats = async (req, res) => {
  try {
    const total = await Notification.countDocuments();
    const active = await Notification.countDocuments({ isActive: true });
    const byType = await Notification.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    const byPriority = await Notification.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);
    
    res.json({
      success: true,
      stats: {
        total,
        active,
        byType,
        byPriority
      }
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notification stats' });
  }
};
