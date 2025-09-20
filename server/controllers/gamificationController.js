import Gamification from '../models/Gamification.js';
import Badge from '../models/Badge.js';
import Reward from '../models/Reward.js';
import User from '../models/User.js';

// Get user gamification stats
export const getUserStats = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.userId) {
      // For demo purposes, try to get test user data
      try {
        const testGamification = await Gamification.findOne({ userId: '68ce9e2aa941cab26d99762c' });
        if (testGamification) {
          return res.json({
            success: true,
            gamification: {
              userId: testGamification.userId,
              level: testGamification.level,
              experience: testGamification.experience,
              points: testGamification.points,
              badges: testGamification.badges,
              rewards: testGamification.rewards || [],
              achievements: testGamification.achievements,
              rank: testGamification.rank,
              streak: testGamification.streak,
              totalBookings: testGamification.totalBookings,
              totalSpent: testGamification.totalSpent
            },
            message: 'Demo user stats (using test data)'
          });
        }
      } catch (error) {
        console.error('Error fetching test gamification data:', error);
      }
      
      // Fallback to default demo data
      return res.json({
        success: true,
        gamification: {
          userId: 'demo-user',
          level: 1,
          experience: 0,
          points: 0,
          badges: [],
          rewards: [],
          achievements: [],
          rank: 'Bronze',
          streak: 0,
          totalBookings: 0,
          totalSpent: 0
        },
        message: 'Demo user stats (not authenticated)'
      });
    }

    const { userId } = req.user;
    
    let gamification = await Gamification.findOne({ userId });
    
    if (!gamification) {
      // Create new gamification profile
      gamification = new Gamification({ userId });
      await gamification.save();
    }
    
    res.json({
      success: true,
      stats: gamification
    });
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user stats'
    });
  }
};

// Get available badges
export const getAvailableBadges = async (req, res) => {
  try {
    const badges = await Badge.find({ isActive: true }).sort({ points: 1 });
    
    res.json({
      success: true,
      badges
    });
  } catch (error) {
    console.error('Error getting badges:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get badges'
    });
  }
};

// Get leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    const leaderboard = await Gamification.find()
      .populate('userId', 'firstName lastName email')
      .sort({ points: -1 })
      .limit(parseInt(limit));
    
    const formattedLeaderboard = leaderboard.map((user, index) => ({
      id: user.userId,
      name: user.userId ? `${user.userId.firstName} ${user.userId.lastName}` : 'Anonymous',
      level: user.level,
      points: user.points,
      rank: user.rank,
      totalBookings: user.totalBookings,
      position: index + 1
    }));
    
    res.json({
      success: true,
      leaderboard: formattedLeaderboard
    });
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get leaderboard'
    });
  }
};

// Get available rewards
export const getRewards = async (req, res) => {
  try {
    const { userId } = req.user;
    
    // Get user's current stats
    const gamification = await Gamification.findOne({ userId });
    if (!gamification) {
      return res.status(404).json({
        success: false,
        message: 'User gamification profile not found'
      });
    }
    
    const rewards = await Reward.find({ 
      isActive: true,
      'requirements.minLevel': { $lte: gamification.level },
      'requirements.minRank': { $in: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'].slice(0, ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'].indexOf(gamification.rank) + 1) }
    }).sort({ cost: 1 });
    
    // Add claimed status to each reward
    const rewardsWithStatus = rewards.map(reward => ({
      ...reward.toObject(),
      canClaim: gamification.points >= reward.cost,
      claimed: false // This would need to be tracked separately
    }));
    
    res.json({
      success: true,
      rewards: rewardsWithStatus
    });
  } catch (error) {
    console.error('Error getting rewards:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get rewards'
    });
  }
};

// Claim reward
export const claimReward = async (req, res) => {
  try {
    const { userId } = req.user;
    const { rewardId } = req.params;
    
    const gamification = await Gamification.findOne({ userId });
    if (!gamification) {
      return res.status(404).json({
        success: false,
        message: 'User gamification profile not found'
      });
    }
    
    const reward = await Reward.findById(rewardId);
    if (!reward || !reward.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Reward not found or inactive'
      });
    }
    
    if (gamification.points < reward.cost) {
      return res.status(400).json({
        success: false,
        message: 'Not enough points to claim this reward'
      });
    }
    
    // Deduct points
    gamification.points -= reward.cost;
    await gamification.save();
    
    // Here you would typically create a reward claim record
    // and send the reward to the user
    
    res.json({
      success: true,
      message: 'Reward claimed successfully',
      remainingPoints: gamification.points
    });
  } catch (error) {
    console.error('Error claiming reward:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to claim reward'
    });
  }
};

// Add experience (internal function)
export const addExperience = async (userId, amount, reason = '') => {
  try {
    let gamification = await Gamification.findOne({ userId });
    
    if (!gamification) {
      gamification = new Gamification({ userId });
    }
    
    const leveledUp = gamification.addExperience(amount);
    await gamification.save();
    
    // Check for new badges
    await checkForNewBadges(gamification, reason);
    
    return { leveledUp, newLevel: gamification.level };
  } catch (error) {
    console.error('Error adding experience:', error);
    return { leveledUp: false, newLevel: gamification?.level || 1 };
  }
};

// Check for new badges
const checkForNewBadges = async (gamification, reason = '') => {
  try {
    const badges = await Badge.find({ isActive: true });
    const newBadges = [];
    
    for (const badge of badges) {
      const hasBadge = gamification.badges.some(b => b.id === badge.id);
      if (hasBadge) continue;
      
      let shouldAward = false;
      
      switch (badge.type) {
        case 'first_booking':
          shouldAward = gamification.totalBookings >= 1;
          break;
        case 'loyal_customer':
          shouldAward = gamification.totalBookings >= 10;
          break;
        case 'early_bird':
          shouldAward = reason === 'early_booking';
          break;
        case 'social_butterfly':
          shouldAward = gamification.totalBookings >= 5 && reason === 'group_booking';
          break;
        case 'movie_buff':
          shouldAward = gamification.totalBookings >= 20;
          break;
        case 'streak_master':
          shouldAward = gamification.streak >= 7;
          break;
      }
      
      if (shouldAward) {
        const badgeAwarded = gamification.addBadge({
          id: badge.id,
          type: badge.type,
          name: badge.name,
          description: badge.description,
          points: badge.points
        });
        
        if (badgeAwarded) {
          newBadges.push(badge);
        }
      }
    }
    
    if (newBadges.length > 0) {
      await gamification.save();
    }
    
    return newBadges;
  } catch (error) {
    console.error('Error checking for badges:', error);
    return [];
  }
};

// Update booking stats
export const updateBookingStats = async (userId, amount, isGroupBooking = false, isPayment = false) => {
  try {
    let gamification = await Gamification.findOne({ userId });
    
    if (!gamification) {
      gamification = new Gamification({ userId });
    }
    
    // Update stats based on whether this is initial booking or payment
    if (!isPayment) {
      // Initial booking - count the booking but don't add to total spent yet
      gamification.totalBookings += 1;
      gamification.lastBookingDate = new Date();
    } else {
      // Payment completion - add to total spent
      gamification.totalSpent += amount;
    }
    
    // Update streak
    const today = new Date();
    const lastBooking = gamification.lastBookingDate;
    
    if (lastBooking) {
      const daysDiff = Math.floor((today - lastBooking) / (1000 * 60 * 60 * 24));
      if (daysDiff === 1) {
        gamification.streak += 1;
      } else if (daysDiff > 1) {
        gamification.streak = 1;
      }
    } else {
      gamification.streak = 1;
    }
    
    // Add experience
    let experienceGained = 10; // Base experience
    if (amount > 50) experienceGained += 5; // Bonus for high-value booking
    if (isGroupBooking) experienceGained += 5; // Bonus for group booking
    
    const { leveledUp } = await addExperience(userId, experienceGained, isGroupBooking ? 'group_booking' : 'booking');
    
    await gamification.save();
    
    return { leveledUp, newLevel: gamification.level };
  } catch (error) {
    console.error('Error updating booking stats:', error);
    return { leveledUp: false, newLevel: 1 };
  }
};
