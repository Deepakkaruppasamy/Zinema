import mongoose from 'mongoose';

const pricingAlertSchema = new mongoose.Schema({
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
  showId: {
    type: String,
    required: true
  },
  showDateTime: {
    type: Date,
    required: true
  },
  alertType: {
    type: String,
    enum: ['increase', 'decrease', 'availability', 'time_based'],
    required: true
  },
  targetPrice: {
    type: Number,
    required: true
  },
  currentPrice: {
    type: Number,
    required: true
  },
  threshold: {
    type: Number,
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
  triggeredAt: Date,
  lastChecked: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('PricingAlert', pricingAlertSchema);
