import User from '../models/User.js';
import Booking from '../models/Booking.js';
import Gamification from '../models/Gamification.js';
import Badge from '../models/Badge.js';
import Reward from '../models/Reward.js';

class DynamicGamificationService {
  constructor() {
    this.tiers = {
      BRONZE: { min: 0, max: 999, multiplier: 1.0, color: '#CD7F32' },
      SILVER: { min: 1000, max: 4999, multiplier: 1.1, color: '#C0C0C0' },
      GOLD: { min: 5000, max: 9999, multiplier: 1.2, color: '#FFD700' },
      PLATINUM: { min: 10000, max: Infinity, multiplier: 1.3, color: '#E5E4E2' }
    };
    
    this.badges = {
      firstBooking: { name: 'First Steps', description: 'Made your first booking', points: 100 },
      movieBuff: { name: 'Movie Buff', description: 'Watched 10 movies', points: 500 },
      socialButterfly: { name: 'Social Butterfly', description: 'Booked with friends 5 times', points: 300 },
      earlyBird: { name: 'Early Bird', description: 'Booked 5 morning shows', points: 200 },
      nightOwl: { name: 'Night Owl', description: 'Booked 5 evening shows', points: 200 },
      genreExplorer: { name: 'Genre Explorer', description: 'Watched 5 different genres', points: 400 },
      loyalCustomer: { name: 'Loyal Customer', description: 'Booked 20 movies', points: 1000 },
      bigSpender: { name: 'Big Spender', description: 'Spent over ₹5000', points: 600 }
    };
  }

  // Update user gamification stats after booking
  async updateUserStats(userId, bookingData) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      // Get or create gamification record
      let gamification = await Gamification.findOne({ userId });
      if (!gamification) {
        gamification = await Gamification.create({
          userId,
          totalPoints: 0,
          tier: 'BRONZE',
          badges: [],
          achievements: []
        });
      }

      // Calculate points for this booking
      const points = this.calculateBookingPoints(bookingData);
      
      // Update total points
      gamification.totalPoints += points;
      
      // Update tier
      const newTier = this.calculateTier(gamification.totalPoints);
      gamification.tier = newTier;
      
      // Check for new badges
      const newBadges = await this.checkForNewBadges(userId, gamification, bookingData);
      gamification.badges.push(...newBadges);
      
      // Check for achievements
      const newAchievements = await this.checkForAchievements(userId, gamification, bookingData);
      gamification.achievements.push(...newAchievements);
      
      // Save updated gamification
      await gamification.save();
      
      // Update user tier
      user.tier = newTier;
      await user.save();
      
      return {
        pointsEarned: points,
        newTier,
        newBadges,
        newAchievements,
        totalPoints: gamification.totalPoints
      };
      
    } catch (error) {
      console.error('Error updating user stats:', error);
      throw error;
    }
  }

  // Calculate points for a booking
  calculateBookingPoints(bookingData) {
    let points = 0;
    
    // Base points for booking
    points += 50;
    
    // Points based on amount spent
    points += Math.floor(bookingData.amount / 100); // 1 point per ₹100
    
    // Bonus for group bookings
    if (bookingData.bookedSeats.length > 1) {
      points += bookingData.bookedSeats.length * 25; // 25 points per additional seat
    }
    
    // Time-based bonuses
    const showTime = new Date(bookingData.showDateTime);
    const hour = showTime.getHours();
    
    if (hour >= 6 && hour < 12) {
      points += 25; // Morning show bonus
    } else if (hour >= 22) {
      points += 30; // Late night show bonus
    }
    
    // Weekend bonus
    const dayOfWeek = showTime.getDay();
    if (dayOfWeek === 5 || dayOfWeek === 6) { // Friday or Saturday
      points += 20;
    }
    
    return points;
  }

  // Calculate user tier based on total points
  calculateTier(totalPoints) {
    for (const [tierName, tierData] of Object.entries(this.tiers)) {
      if (totalPoints >= tierData.min && totalPoints < tierData.max) {
        return tierName;
      }
    }
    return 'PLATINUM'; // Default to highest tier
  }

  // Check for new badges
  async checkForNewBadges(userId, gamification, bookingData) {
    const newBadges = [];
    const userBookings = await Booking.find({ userId, isPaid: true })
      .populate('show')
      .sort({ createdAt: -1 });
    
    const totalBookings = userBookings.length;
    const totalSpent = userBookings.reduce((sum, b) => sum + b.amount, 0);
    
    // Check each badge
    for (const [badgeKey, badgeData] of Object.entries(this.badges)) {
      if (gamification.badges.includes(badgeKey)) continue; // Already has badge
      
      let shouldAward = false;
      
      switch (badgeKey) {
        case 'firstBooking':
          shouldAward = totalBookings >= 1;
          break;
        case 'movieBuff':
          shouldAward = totalBookings >= 10;
          break;
        case 'socialButterfly':
          const groupBookings = userBookings.filter(b => b.bookedSeats.length > 1);
          shouldAward = groupBookings.length >= 5;
          break;
        case 'earlyBird':
          const morningBookings = userBookings.filter(b => {
            const hour = new Date(b.show.showDateTime).getHours();
            return hour >= 6 && hour < 12;
          });
          shouldAward = morningBookings.length >= 5;
          break;
        case 'nightOwl':
          const eveningBookings = userBookings.filter(b => {
            const hour = new Date(b.show.showDateTime).getHours();
            return hour >= 18;
          });
          shouldAward = eveningBookings.length >= 5;
          break;
        case 'genreExplorer':
          const genres = new Set();
          userBookings.forEach(b => {
            b.show.movie.genres?.forEach(genre => genres.add(genre.name));
          });
          shouldAward = genres.size >= 5;
          break;
        case 'loyalCustomer':
          shouldAward = totalBookings >= 20;
          break;
        case 'bigSpender':
          shouldAward = totalSpent >= 5000;
          break;
      }
      
      if (shouldAward) {
        newBadges.push(badgeKey);
        
        // Create badge record
        await Badge.create({
          userId,
          badgeType: badgeKey,
          name: badgeData.name,
          description: badgeData.description,
          points: badgeData.points,
          earnedAt: new Date()
        });
        
        // Add badge points to total
        gamification.totalPoints += badgeData.points;
      }
    }
    
    return newBadges;
  }

  // Check for achievements
  async checkForAchievements(userId, gamification, bookingData) {
    const newAchievements = [];
    
    // Streak achievements
    const streak = await this.calculateBookingStreak(userId);
    if (streak >= 7 && !gamification.achievements.includes('weekStreak')) {
      newAchievements.push('weekStreak');
    }
    if (streak >= 30 && !gamification.achievements.includes('monthStreak')) {
      newAchievements.push('monthStreak');
    }
    
    // Spending achievements
    const totalSpent = await this.calculateTotalSpent(userId);
    if (totalSpent >= 10000 && !gamification.achievements.includes('bigSpender')) {
      newAchievements.push('bigSpender');
    }
    
    return newAchievements;
  }

  // Calculate booking streak
  async calculateBookingStreak(userId) {
    const bookings = await Booking.find({ userId, isPaid: true })
      .sort({ createdAt: -1 });
    
    if (bookings.length === 0) return 0;
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (const booking of bookings) {
      const bookingDate = new Date(booking.createdAt);
      bookingDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((currentDate - bookingDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
        currentDate = new Date(bookingDate);
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  }

  // Calculate total spent by user
  async calculateTotalSpent(userId) {
    const bookings = await Booking.find({ userId, isPaid: true });
    return bookings.reduce((sum, booking) => sum + booking.amount, 0);
  }

  // Get user's gamification dashboard
  async getUserDashboard(userId) {
    try {
      const gamification = await Gamification.findOne({ userId });
      const badges = await Badge.find({ userId }).sort({ earnedAt: -1 });
      const recentBookings = await Booking.find({ userId, isPaid: true })
        .populate('show')
        .sort({ createdAt: -1 })
        .limit(10);
      
      if (!gamification) {
        return {
          tier: 'BRONZE',
          totalPoints: 0,
          badges: [],
          achievements: [],
          recentActivity: [],
          nextTier: this.getNextTierInfo('BRONZE')
        };
      }
      
      return {
        tier: gamification.tier,
        totalPoints: gamification.totalPoints,
        badges: badges,
        achievements: gamification.achievements,
        recentActivity: recentBookings.map(booking => ({
          movie: booking.show.movie.title,
          points: this.calculateBookingPoints(booking),
          date: booking.createdAt
        })),
        nextTier: this.getNextTierInfo(gamification.tier),
        tierBenefits: this.getTierBenefits(gamification.tier)
      };
      
    } catch (error) {
      console.error('Error getting user dashboard:', error);
      throw error;
    }
  }

  // Get next tier information
  getNextTierInfo(currentTier) {
    const tierOrder = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'];
    const currentIndex = tierOrder.indexOf(currentTier);
    
    if (currentIndex === tierOrder.length - 1) {
      return null; // Already at highest tier
    }
    
    const nextTier = tierOrder[currentIndex + 1];
    const nextTierData = this.tiers[nextTier];
    
    return {
      name: nextTier,
      pointsNeeded: nextTierData.min,
      benefits: this.getTierBenefits(nextTier)
    };
  }

  // Get tier benefits
  getTierBenefits(tier) {
    const benefits = {
      BRONZE: ['Basic booking', 'Standard support'],
      SILVER: ['5% discount on bookings', 'Priority support', 'Early access to new releases'],
      GOLD: ['10% discount on bookings', 'Premium support', 'Free upgrades', 'Exclusive events'],
      PLATINUM: ['15% discount on bookings', 'VIP support', 'Free premium seats', 'Personal concierge', 'Exclusive screenings']
    };
    
    return benefits[tier] || [];
  }

  // Generate dynamic rewards
  async generateRewards(userId) {
    try {
      const gamification = await Gamification.findOne({ userId });
      if (!gamification) return [];
      
      const rewards = [];
      const tier = gamification.tier;
      
      // Tier-based rewards
      if (tier === 'SILVER' || tier === 'GOLD' || tier === 'PLATINUM') {
        rewards.push({
          type: 'discount',
          value: this.tiers[tier].multiplier - 1,
          description: `${Math.round((this.tiers[tier].multiplier - 1) * 100)}% discount on next booking`,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        });
      }
      
      // Points-based rewards
      if (gamification.totalPoints >= 1000) {
        rewards.push({
          type: 'free_popcorn',
          value: 1,
          description: 'Free popcorn on your next visit',
          expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days
        });
      }
      
      // Save rewards
      for (const reward of rewards) {
        await Reward.create({
          userId,
          ...reward,
          createdAt: new Date()
        });
      }
      
      return rewards;
      
    } catch (error) {
      console.error('Error generating rewards:', error);
      throw error;
    }
  }

  // Get leaderboard
  async getLeaderboard(limit = 10) {
    try {
      const topUsers = await Gamification.find({})
        .populate('userId', 'name email image')
        .sort({ totalPoints: -1 })
        .limit(limit);
      
      return topUsers.map((user, index) => ({
        rank: index + 1,
        name: user.userId.name,
        email: user.userId.email,
        image: user.userId.image,
        tier: user.tier,
        totalPoints: user.totalPoints,
        badges: user.badges.length
      }));
      
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      throw error;
    }
  }
}

export default new DynamicGamificationService();
