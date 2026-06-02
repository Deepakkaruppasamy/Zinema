import mongoose from 'mongoose';

const gamificationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  level: {
    type: Number,
    default: 1
  },
  experience: {
    type: Number,
    default: 0
  },
  points: {
    type: Number,
    default: 0
  },
  rank: {
    type: String,
    enum: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'],
    default: 'Bronze'
  },
  badges: [{
    id: String,
    type: {
      type: String,
      enum: ['first_booking', 'loyal_customer', 'early_bird', 'social_butterfly', 'movie_buff', 'streak_master']
    },
    name: String,
    description: String,
    points: Number,
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  achievements: [{
    id: String,
    type: String,
    name: String,
    description: String,
    unlockedAt: {
      type: Date,
      default: Date.now
    }
  }],
  streak: {
    type: Number,
    default: 0
  },
  totalBookings: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  lastBookingDate: Date,
  preferences: {
    notifications: {
      type: Boolean,
      default: true
    },
    publicProfile: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

gamificationSchema.methods.calculateRank = function() {
  if (this.points >= 10000) return 'Diamond';
  if (this.points >= 5000) return 'Platinum';
  if (this.points >= 2000) return 'Gold';
  if (this.points >= 500) return 'Silver';
  return 'Bronze';
};

gamificationSchema.methods.addExperience = function(amount) {
  this.experience += amount;
  const oldLevel = this.level;
  
  this.level = Math.floor(this.experience / 100) + 1;
  
  if (this.level > oldLevel) {
    this.points += (this.level - oldLevel) * 50;
  }
  
  this.rank = this.calculateRank();
  
  return this.level > oldLevel;
};

gamificationSchema.methods.addBadge = function(badgeData) {
  const existingBadge = this.badges.find(badge => badge.id === badgeData.id);
  if (!existingBadge) {
    this.badges.push(badgeData);
    this.points += badgeData.points || 0;
    return true;
  }
  return false;
};

export default mongoose.model('Gamification', gamificationSchema);
