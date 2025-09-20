import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Star, 
  Zap, 
  Crown, 
  Target, 
  Award,
  Gift,
  Coins,
  Flame,
  Clock,
  Users,
  Calendar,
  Heart,
  Eye,
  CheckCircle,
  Lock,
  Unlock
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const GamificationSystem = () => {
  const { axios, getToken, user } = useAppContext();
  const [userStats, setUserStats] = useState({
    level: 1,
    experience: 0,
    points: 0,
    badges: [],
    achievements: [],
    streak: 0,
    totalBookings: 0,
    totalSpent: 0,
    rank: 'Bronze'
  });
  const [availableBadges, setAvailableBadges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user) {
      loadUserStats();
      loadAvailableBadges();
      loadLeaderboard();
      loadRewards();
    }
  }, [user]);

  const loadUserStats = async () => {
    try {
      const { data } = await axios.get('/api/user/gamification', {
        headers: { Authorization: `Bearer ${await getToken()}` }
      });
      
      if (data.success) {
        setUserStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableBadges = async () => {
    try {
      const { data } = await axios.get('/api/gamification/badges');
      
      if (data.success) {
        setAvailableBadges(data.badges);
      }
    } catch (error) {
      console.error('Error loading badges:', error);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const { data } = await axios.get('/api/gamification/leaderboard');
      
      if (data.success) {
        setLeaderboard(data.leaderboard);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };

  const loadRewards = async () => {
    try {
      const { data } = await axios.get('/api/gamification/rewards');
      
      if (data.success) {
        setRewards(data.rewards);
      }
    } catch (error) {
      console.error('Error loading rewards:', error);
    }
  };

  const claimReward = async (rewardId) => {
    try {
      const { data } = await axios.post(`/api/gamification/rewards/${rewardId}/claim`, {}, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      });
      
      if (data.success) {
        toast.success('Reward claimed!');
        loadUserStats();
        loadRewards();
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
      toast.error('Failed to claim reward');
    }
  };

  const getLevelProgress = () => {
    const currentLevelExp = userStats.level * 100;
    const nextLevelExp = (userStats.level + 1) * 100;
    const progress = ((userStats.experience - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100;
    return Math.max(0, Math.min(100, progress));
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 'Bronze': return 'text-orange-400';
      case 'Silver': return 'text-gray-300';
      case 'Gold': return 'text-yellow-400';
      case 'Platinum': return 'text-blue-400';
      case 'Diamond': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const getBadgeIcon = (badgeType) => {
    switch (badgeType) {
      case 'first_booking': return <Target className="w-6 h-6" />;
      case 'loyal_customer': return <Heart className="w-6 h-6" />;
      case 'early_bird': return <Clock className="w-6 h-6" />;
      case 'social_butterfly': return <Users className="w-6 h-6" />;
      case 'movie_buff': return <Eye className="w-6 h-6" />;
      case 'streak_master': return <Flame className="w-6 h-6" />;
      default: return <Award className="w-6 h-6" />;
    }
  };

  const getBadgeColor = (badgeType) => {
    switch (badgeType) {
      case 'first_booking': return 'text-green-400 bg-green-400/10';
      case 'loyal_customer': return 'text-red-400 bg-red-400/10';
      case 'early_bird': return 'text-yellow-400 bg-yellow-400/10';
      case 'social_butterfly': return 'text-blue-400 bg-blue-400/10';
      case 'movie_buff': return 'text-purple-400 bg-purple-400/10';
      case 'streak_master': return 'text-orange-400 bg-orange-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <h2 className="text-2xl font-bold text-white">Gamification Hub</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-sm text-gray-400">Level {userStats.level}</div>
            <div className="text-lg font-bold text-white">{userStats.points} pts</div>
          </div>
          <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <Crown className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'overview'
              ? 'bg-primary text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('badges')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'badges'
              ? 'bg-primary text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          Badges
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'leaderboard'
              ? 'bg-primary text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          Leaderboard
        </button>
        <button
          onClick={() => setActiveTab('rewards')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'rewards'
              ? 'bg-primary text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          Rewards
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Level Progress */}
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-500/30 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Level Progress</h3>
              <span className="text-2xl font-bold text-white">Level {userStats.level}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${getLevelProgress()}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-300">
              <span>{userStats.experience} XP</span>
              <span>{((userStats.level + 1) * 100) - userStats.experience} XP to next level</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 p-4 rounded-lg border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-gray-300">Total Bookings</span>
              </div>
              <div className="text-2xl font-bold text-white">{userStats.totalBookings}</div>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="w-5 h-5 text-green-400" />
                <span className="text-sm text-gray-300">Total Spent</span>
              </div>
              <div className="text-2xl font-bold text-white">${userStats.totalSpent}</div>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-5 h-5 text-orange-400" />
                <span className="text-sm text-gray-300">Current Streak</span>
              </div>
              <div className="text-2xl font-bold text-white">{userStats.streak} days</div>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span className="text-sm text-gray-300">Rank</span>
              </div>
              <div className={`text-2xl font-bold ${getRankColor(userStats.rank)}`}>
                {userStats.rank}
              </div>
            </div>
          </div>

          {/* Recent Badges */}
          <div className="bg-gray-800/50 rounded-lg border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Badges</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userStats.badges.slice(0, 6).map((badge) => (
                <div
                  key={badge.id}
                  className={`p-4 rounded-lg border ${getBadgeColor(badge.type)}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    {getBadgeIcon(badge.type)}
                    <span className="font-semibold">{badge.name}</span>
                  </div>
                  <p className="text-sm text-gray-300">{badge.description}</p>
                  <div className="text-xs text-gray-400 mt-2">
                    Earned {new Date(badge.earnedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Badges Tab */}
      {activeTab === 'badges' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">All Badges</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableBadges.map((badge) => {
              const isEarned = userStats.badges.some(b => b.id === badge.id);
              
              return (
                <div
                  key={badge.id}
                  className={`p-4 rounded-lg border transition-all ${
                    isEarned 
                      ? getBadgeColor(badge.type)
                      : 'border-gray-600 bg-gray-800/30 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    {isEarned ? getBadgeIcon(badge.type) : <Lock className="w-6 h-6 text-gray-500" />}
                    <span className="font-semibold">{badge.name}</span>
                    {isEarned && <CheckCircle className="w-5 h-5 text-green-400" />}
                  </div>
                  <p className="text-sm text-gray-300 mb-2">{badge.description}</p>
                  <div className="text-xs text-gray-400">
                    {badge.points} points • {badge.requirement}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Leaderboard</h3>
          <div className="space-y-2">
            {leaderboard.map((player, index) => (
              <div
                key={player.id}
                className={`p-4 rounded-lg border transition-all ${
                  player.id === user?.id
                    ? 'border-primary bg-primary/10'
                    : 'border-white/10 bg-gray-800/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-700 text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-white">
                        {player.name} {player.id === user?.id && '(You)'}
                      </div>
                      <div className="text-sm text-gray-400">
                        Level {player.level} • {player.points} points
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${getRankColor(player.rank)}`}>
                      {player.rank}
                    </div>
                    <div className="text-sm text-gray-400">
                      {player.totalBookings} bookings
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rewards Tab */}
      {activeTab === 'rewards' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Available Rewards</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.map((reward) => {
              const canClaim = userStats.points >= reward.cost && !reward.claimed;
              
              return (
                <div
                  key={reward.id}
                  className={`p-4 rounded-lg border transition-all ${
                    canClaim
                      ? 'border-green-500 bg-green-500/10'
                      : reward.claimed
                      ? 'border-gray-600 bg-gray-800/30 opacity-60'
                      : 'border-white/10 bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Gift className="w-6 h-6 text-yellow-400" />
                    <span className="font-semibold text-white">{reward.name}</span>
                    {reward.claimed && <CheckCircle className="w-5 h-5 text-green-400" />}
                  </div>
                  <p className="text-sm text-gray-300 mb-3">{reward.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Coins className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-semibold">{reward.cost} points</span>
                    </div>
                    <button
                      onClick={() => claimReward(reward.id)}
                      disabled={!canClaim}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        canClaim
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {reward.claimed ? 'Claimed' : canClaim ? 'Claim' : 'Not enough points'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default GamificationSystem;
