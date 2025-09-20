import mongoose from 'mongoose';

const reminderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  movieId: {
    type: String,
    required: true
  },
  movieTitle: {
    type: String,
    required: true
  },
  reminderType: {
    type: String,
    enum: ['release', 'booking', 'showtime', 'price_drop'],
    required: true
  },
  reminderTime: {
    type: Date,
    required: true
  },
  enabled: {
    type: Boolean,
    default: true
  },
  triggered: {
    type: Boolean,
    default: false
  },
  sendAt: Date,
  channel: {
    type: String,
    enum: ['email', 'sms', 'push', 'whatsapp'],
    default: 'email'
  },
  message: String,
  metadata: {
    showId: String,
    targetPrice: Number,
    threshold: Number
  }
}, {
  timestamps: true
});

export default mongoose.model('Reminder', reminderSchema);