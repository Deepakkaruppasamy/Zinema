import mongoose from 'mongoose';

const userPreferencesSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  moviePreferences: {
    genres: [String],
    ratings: [Number],
    years: [Number],
    runtime: {
      min: Number,
      max: Number
    },
    languages: [String]
  },
  seatPreferences: {
    viewPreference: {
      type: String,
      enum: ['front', 'center', 'back'],
      default: 'center'
    },
    seatType: {
      type: String,
      enum: ['standard', 'premium', 'aisle'],
      default: 'standard'
    },
    priceSensitivity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    accessibility: {
      type: Boolean,
      default: false
    }
  },
  notificationPreferences: {
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: false
    },
    push: {
      type: Boolean,
      default: true
    },
    whatsapp: {
      type: Boolean,
      default: false
    }
  },
  privacySettings: {
    publicProfile: {
      type: Boolean,
      default: true
    },
    showActivity: {
      type: Boolean,
      default: true
    },
    allowRecommendations: {
      type: Boolean,
      default: true
    }
  },
  aiSettings: {
    recommendationStrength: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.7
    },
    learningEnabled: {
      type: Boolean,
      default: true
    },
    feedbackEnabled: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

export default mongoose.model('UserPreferences', userPreferencesSchema);
