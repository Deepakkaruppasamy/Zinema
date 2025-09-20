import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['first_booking', 'loyal_customer', 'early_bird', 'social_butterfly', 'movie_buff', 'streak_master'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  points: {
    type: Number,
    default: 0
  },
  requirement: {
    type: String,
    required: true
  },
  icon: String,
  color: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Badge', badgeSchema);
