import mongoose from 'mongoose';

const rewardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  cost: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['discount', 'free_ticket', 'premium_seat', 'concession', 'merchandise'],
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  maxUses: {
    type: Number,
    default: null
  },
  expiryDate: Date,
  requirements: {
    minLevel: {
      type: Number,
      default: 1
    },
    minRank: {
      type: String,
      enum: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'],
      default: 'Bronze'
    }
  }
}, {
  timestamps: true
});

export default mongoose.model('Reward', rewardSchema);
