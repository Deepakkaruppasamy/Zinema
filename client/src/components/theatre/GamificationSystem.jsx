import React, { useState, useEffect } from 'react';
import { FaTrophy, FaStar, FaMedal, FaGift, FaFire, FaUsers, FaChartLine, FaCrown, FaGem, FaAward, FaRocket, FaHeart, FaBolt, FaBullseye, FaCheckCircle, FaUser } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const GamificationSystem = ({ userId, onRewardClaim, onAchievementUnlock }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchGamificationData();
    }
  }, [userId]);

  const fetchGamificationData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchUserProfile(),
        fetchAchievements(),
        fetchRewards(),
        fetchLeaderboard()
      ]);
    } catch (error) {
      console.error('Error fetching gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    const mockProfile = {
      userId: userId,
      tier: 'GOLD',
      totalPoints: 2450,
      level: 12,
      nextLevelPoints: 500,
      currentStreak: 7,
      longestStreak: 15,
      totalBookings: 23,
      totalSpent: 5750,
      badges: 8,
      achievements: 12,
      rank: 15,
      tierBenefits: [
        '10% discount on all bookings',
        'Priority support',
        'Free upgrades',
        'Exclusive events'
      ],
      recentActivity: [
        { action: 'Movie Booking', points: 50, date: '2024-01-15' },
        { action: 'Food Order', points: 25, date: '2024-01-14' },
        { action: 'Review Posted', points: 10, date: '2024-01-13' },
        { action: 'Referral Bonus', points: 100, date: '2024-01-12' }
      ]
    };

    await new Promise(resolve => setTimeout(resolve, 800));
    setUserProfile(mockProfile);
  };

  const fetchAchievements = async () => {
    const mockAchievements = [
      {
        id: 1,
        name: 'Movie Buff',
        description: 'Watched 10 movies',
        icon: <FaStar />,
        points: 500,
        progress: 10,
        maxProgress: 10,
        isUnlocked: true,
        unlockedAt: '2024-01-10',
        rarity: 'common'
      },
      {
        id: 2,
        name: 'Social Butterfly',
        description: 'Booked with friends 5 times',
        icon: <FaUsers />,
        points: 300,
        progress: 3,
        maxProgress: 5,
        isUnlocked: false,
        rarity: 'uncommon'
      },
      {
        id: 3,
        name: 'Early Bird',
        description: 'Booked 5 morning shows',
        icon: <FaBolt />,
        points: 200,
        progress: 2,
        maxProgress: 5,
        isUnlocked: false,
        rarity: 'common'
      },
      {
        id: 4,
        name: 'Loyal Customer',
        description: 'Booked 20 movies',
        icon: <FaHeart />,
        points: 1000,
        progress: 23,
        maxProgress: 20,
        isUnlocked: true,
        unlockedAt: '2024-01-05',
        rarity: 'rare'
      },
      {
        id: 5,
        name: 'Big Spender',
        description: 'Spent over ₹5000',
        icon: <FaGem />,
        points: 600,
        progress: 5750,
        maxProgress: 5000,
        isUnlocked: true,
        unlockedAt: '2024-01-08',
        rarity: 'uncommon'
      },
      {
        id: 6,
        name: 'Streak Master',
        description: '7-day booking streak',
        icon: <FaFire />,
        points: 400,
        progress: 7,
        maxProgress: 7,
        isUnlocked: true,
        unlockedAt: '2024-01-15',
        rarity: 'rare'
      }
    ];

    await new Promise(resolve => setTimeout(resolve, 600));
    setAchievements(mockAchievements);
  };

  const fetchRewards = async () => {
    const mockRewards = [
      {
        id: 1,
        name: 'Free Popcorn',
        description: 'Complimentary popcorn on your next visit',
        type: 'food',
        value: 120,
        pointsRequired: 200,
        expiresAt: '2024-02-15',
        isClaimed: false,
        icon: <FaGift />
      },
      {
        id: 2,
        name: '10% Discount',
        description: '10% off your next booking',
        type: 'discount',
        value: 10,
        pointsRequired: 500,
        expiresAt: '2024-02-20',
        isClaimed: false,
        icon: <FaBullseye />
      },
      {
        id: 3,
        name: 'Premium Upgrade',
        description: 'Free upgrade to premium seats',
        type: 'upgrade',
        value: 100,
        pointsRequired: 800,
        expiresAt: '2024-02-25',
        isClaimed: true,
        icon: <FaCrown />
      },
      {
        id: 4,
        name: 'VIP Experience',
        description: 'Exclusive VIP screening access',
        type: 'experience',
        value: 500,
        pointsRequired: 1500,
        expiresAt: '2024-03-01',
        isClaimed: false,
        icon: <FaRocket />
      }
    ];

    await new Promise(resolve => setTimeout(resolve, 400));
    setRewards(mockRewards);
  };

  const fetchLeaderboard = async () => {
    const mockLeaderboard = [
      { rank: 1, name: 'Alex Johnson', points: 5420, tier: 'PLATINUM', avatar: '👑' },
      { rank: 2, name: 'Sarah Wilson', points: 4890, tier: 'GOLD', avatar: '🥇' },
      { rank: 3, name: 'Mike Chen', points: 4560, tier: 'GOLD', avatar: '🥈' },
      { rank: 4, name: 'Emma Davis', points: 4230, tier: 'GOLD', avatar: '🥉' },
      { rank: 5, name: 'David Brown', points: 3980, tier: 'SILVER', avatar: '⭐' },
      { rank: 15, name: 'You', points: 2450, tier: 'GOLD', avatar: '🎯', isCurrentUser: true }
    ];

    await new Promise(resolve => setTimeout(resolve, 300));
    setLeaderboard(mockLeaderboard);
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'BRONZE': return 'text-orange-400';
      case 'SILVER': return 'text-gray-300';
      case 'GOLD': return 'text-yellow-400';
      case 'PLATINUM': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const getTierIcon = (tier) => {
    switch (tier) {
      case 'BRONZE': return <FaMedal className="text-orange-400" />;
      case 'SILVER': return <FaMedal className="text-gray-300" />;
      case 'GOLD': return <FaTrophy className="text-yellow-400" />;
      case 'PLATINUM': return <FaCrown className="text-purple-400" />;
      default: return <FaStar className="text-gray-400" />;
    }
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'text-gray-400';
      case 'uncommon': return 'text-green-400';
      case 'rare': return 'text-blue-400';
      case 'epic': return 'text-purple-400';
      case 'legendary': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const claimReward = (reward) => {
    setSelectedReward(reward);
    setShowRewardModal(true);
  };

  const confirmClaimReward = () => {
    if (selectedReward && onRewardClaim) {
      onRewardClaim(selectedReward);
    }
    setShowRewardModal(false);
    setSelectedReward(null);
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: <FaUser /> },
    { id: 'achievements', name: 'Achievements', icon: <FaAward /> },
    { id: 'rewards', name: 'Rewards', icon: <FaGift /> },
    { id: 'leaderboard', name: 'Leaderboard', icon: <FaChartLine /> }
  ];

  if (loading) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-800/50 rounded"></div>
          <div className="h-64 bg-gray-800/50 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg">
            <FaTrophy className="text-primary text-xl" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Gamification & Rewards</h3>
            <p className="text-gray-400 text-sm">Earn points, unlock achievements, and claim rewards</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-800/30 rounded-lg p-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-primary text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            {tab.icon}
            <span className="text-sm font-medium">{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'profile' && userProfile && (
          <div className="space-y-6">
            {/* User Profile Card */}
            <div className="bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-xl p-6 border border-primary/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">🎯</div>
                  <div>
                    <h4 className="text-2xl font-bold text-white">Your Profile</h4>
                    <div className="flex items-center gap-2">
                      {getTierIcon(userProfile.tier)}
                      <span className={`text-lg font-semibold ${getTierColor(userProfile.tier)}`}>
                        {userProfile.tier} Member
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">{userProfile.totalPoints}</div>
                  <div className="text-sm text-gray-400">Total Points</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{userProfile.level}</div>
                  <div className="text-sm text-gray-400">Level</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{userProfile.currentStreak}</div>
                  <div className="text-sm text-gray-400">Day Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{userProfile.totalBookings}</div>
                  <div className="text-sm text-gray-400">Bookings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{userProfile.badges}</div>
                  <div className="text-sm text-gray-400">Badges</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Level {userProfile.level}</span>
                  <span>{userProfile.nextLevelPoints} points to next level</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-primary to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: '75%' }}
                  ></div>
                </div>
              </div>

              {/* Tier Benefits */}
              <div>
                <h5 className="text-lg font-semibold text-white mb-2">Your Benefits</h5>
                <div className="flex flex-wrap gap-2">
                  {userProfile.tierBenefits.map((benefit, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary/15 text-primary text-sm rounded-full border border-primary/30"
                    >
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h5 className="text-lg font-semibold text-white mb-4">Recent Activity</h5>
              <div className="space-y-3">
                {userProfile.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                        <FaCheckCircle className="text-primary text-sm" />
                      </div>
                      <div>
                        <div className="text-white font-medium">{activity.action}</div>
                        <div className="text-sm text-gray-400">{activity.date}</div>
                      </div>
                    </div>
                    <div className="text-primary font-bold">+{activity.points}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Achievements</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl border transition-all duration-300 ${
                    achievement.isUnlocked
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-gray-800/30 border-white/10'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`text-2xl ${achievement.isUnlocked ? 'text-green-400' : 'text-gray-500'}`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-lg font-semibold text-white">{achievement.name}</h5>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${getRarityColor(achievement.rarity)}`}>
                            {achievement.rarity.toUpperCase()}
                          </span>
                          <span className="text-primary font-bold">+{achievement.points}</span>
                        </div>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">{achievement.description}</p>
                      
                      <div className="mb-3">
                        <div className="flex justify-between text-sm text-gray-400 mb-1">
                          <span>Progress</span>
                          <span>{achievement.progress}/{achievement.maxProgress}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              achievement.isUnlocked ? 'bg-green-400' : 'bg-primary'
                            }`}
                            style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      {achievement.isUnlocked && (
                        <div className="flex items-center gap-2 text-sm text-green-400">
                          <FaCheckCircle />
                          <span>Unlocked on {achievement.unlockedAt}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'rewards' && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Available Rewards</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rewards.map((reward) => (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl border transition-all duration-300 ${
                    reward.isClaimed
                      ? 'bg-gray-600/30 border-gray-500/30 opacity-60'
                      : 'bg-gray-800/30 border-white/10 hover:border-primary/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`text-2xl ${reward.isClaimed ? 'text-gray-500' : 'text-primary'}`}>
                      {reward.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-lg font-semibold text-white">{reward.name}</h5>
                        <div className="text-primary font-bold">{reward.pointsRequired} pts</div>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">{reward.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-400">
                          Expires: {reward.expiresAt}
                        </div>
                        <button
                          onClick={() => claimReward(reward)}
                          disabled={reward.isClaimed || userProfile?.totalPoints < reward.pointsRequired}
                          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                            reward.isClaimed
                              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                              : userProfile?.totalPoints < reward.pointsRequired
                              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                              : 'bg-primary hover:bg-primary/80 text-white'
                          }`}
                        >
                          {reward.isClaimed ? 'Claimed' : 'Claim'}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Leaderboard</h4>
            <div className="space-y-3">
              {leaderboard.map((user, index) => (
                <motion.div
                  key={user.rank}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${
                    user.isCurrentUser
                      ? 'bg-primary/20 border border-primary/30'
                      : 'bg-gray-800/30 border border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{user.avatar}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="text-lg font-semibold text-white">{user.name}</h5>
                        {user.isCurrentUser && (
                          <span className="px-2 py-1 bg-primary text-white text-xs rounded-full">
                            You
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {getTierIcon(user.tier)}
                        <span className={`text-sm font-medium ${getTierColor(user.tier)}`}>
                          {user.tier}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-primary">{user.points.toLocaleString()}</div>
                    <div className="text-sm text-gray-400">points</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reward Claim Modal */}
      <AnimatePresence>
        {showRewardModal && selectedReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-6 max-w-md w-full"
            >
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">{selectedReward.icon}</div>
                <h3 className="text-2xl font-bold text-white mb-2">Claim Reward</h3>
                <p className="text-gray-400">Are you sure you want to claim this reward?</p>
              </div>

              <div className="bg-gray-800/30 rounded-xl p-4 mb-6">
                <h4 className="text-lg font-semibold text-white mb-2">{selectedReward.name}</h4>
                <p className="text-gray-400 text-sm mb-3">{selectedReward.description}</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Cost:</span>
                  <span className="text-primary font-bold">{selectedReward.pointsRequired} points</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowRewardModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmClaimReward}
                  className="flex-1 px-4 py-3 bg-primary hover:bg-primary/80 text-white rounded-lg font-semibold transition-colors"
                >
                  Claim Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GamificationSystem;
