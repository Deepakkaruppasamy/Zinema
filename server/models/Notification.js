import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['new_movie', 'general', 'promotion', 'system'],
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  targetAudience: {
    type: String,
    enum: ['all', 'premium', 'specific'],
    default: 'all'
  },
  targetUsers: [{
    type: String // User IDs for specific targeting
  }],
  movieId: {
    type: String, // Changed to String to match Movie model's _id type
    ref: 'Movie',
    required: false
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readBy: [{
    userId: String,
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  expiresAt: {
    type: Date,
    required: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: String, // Admin user ID
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ isActive: 1, targetAudience: 1, createdAt: -1 });
notificationSchema.index({ readBy: 1 });

export default mongoose.model('Notification', notificationSchema);
