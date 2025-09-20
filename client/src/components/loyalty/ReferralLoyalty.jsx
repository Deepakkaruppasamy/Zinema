import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Gift, 
  Share2, 
  Copy, 
  Check,
  Star,
  Crown,
  Coins,
  Percent,
  Calendar,
  TrendingUp,
  Award,
  UserPlus,
  CreditCard,
  Clock,
  Zap
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const ReferralLoyalty = () => {
  const { axios, getToken, user } = useAppContext();
  const [loyaltyStats, setLoyaltyStats] = useState({
    tier: 'Bronze',
    points: 0,
    totalEarned: 0,
    totalRedeemed: 0,
    nextTierPoints: 1000,
    referrals: 0,
    referralEarnings: 0,
    lifetimeValue: 0
  });
  const [referralCode, setReferralCode] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const [referrals, setReferrals] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (user) {
      loadLoyaltyStats();
      loadReferralCode();
      loadReferrals();
      loadRewards();
    }
  }, [user]);

  const loadLoyaltyStats = async () => {
    try {
      const { data } = await axios.get('/api/user/loyalty', {
        headers: { Authorization: `Bearer ${await getToken()}` }
      });
      
      if (data.success) {
        setLoyaltyStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading loyalty stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReferralCode = async () => {
    try {
      const { data } = await axios.get('/api/user/referral-code', {
        headers: { Authorization: `Bearer ${await getToken()}` }
      });
      
      if (data.success) {
        setReferralCode(data.code);
        setReferralLink(`${window.location.origin}/referral/${data.code}`);
      }
    } catch (error) {
      console.error('Error loading referral code:', error);
    }
  };

  const loadReferrals = async () => {
    try {
      const { data } = await axios.get('/api/user/referrals', {
        headers: { Authorization: `Bearer ${await getToken()}` }
      });
      
      if (data.success) {
        setReferrals(data.referrals);
      }
    } catch (error) {
      console.error('Error loading referrals:', error);
    }
  };

  const loadRewards = async () => {
    try {
      const { data } = await axios.get('/api/loyalty/rewards', {
        headers: { Authorization: `Bearer ${await getToken()}` }
      });
      
      if (data.success) {
        setRewards(data.rewards);
      }
    } catch (error) {
      console.error('Error loading rewards:', error);
    }
  };

  const redeemReward = async (rewardId) => {
    try {
      const { data } = await axios.post(`/api/loyalty/rewards/${rewardId}/redeem`, {}, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      });
      
      if (data.success) {
        toast.success('Reward redeemed successfully!');
        loadLoyaltyStats();
        loadRewards();
      }
    } catch (error) {
      console.error('Error redeeming reward:', error);
      toast.error('Failed to redeem reward');
    }
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    toast.success('Referral code copied!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const shareReferral = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join me on Zinema!',
        text: 'Get amazing movie booking experience with Zinema',
        url: referralLink
      });
    } else {
      copyReferralLink();
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'Bronze': return 'text-orange-400';
      case 'Silver': return 'text-gray-300';
      case 'Gold': return 'text-yellow-400';
      case 'Platinum': return 'text-blue-400';
      case 'Diamond': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const getTierIcon = (tier) => {
    switch (tier) {
      case 'Bronze': return <Award className="w-6 h-6" />;
      case 'Silver': return <Star className="w-6 h-6" />;
      case 'Gold': return <Crown className="w-6 h-6" />;
      case 'Platinum': return <Crown className="w-6 h-6" />;
      case 'Diamond': return <Crown className="w-6 h-6" />;
      default: return <Award className="w-6 h-6" />;
    }
  };

  const getTierBenefits = (tier) => {
    switch (tier) {
      case 'Bronze':
        return ['5% discount on bookings', 'Early access to new releases', 'Priority support'];
      case 'Silver':
        return ['10% discount on bookings', 'Free upgrades', 'Exclusive content', 'Birthday rewards'];
      case 'Gold':
        return ['15% discount on bookings', 'VIP seating', 'Free snacks', 'Concierge service'];
      case 'Platinum':
        return ['20% discount on bookings', 'Private screenings', 'Personal manager', 'Luxury perks'];
      case 'Diamond':
        return ['25% discount on bookings', 'All-inclusive experience', 'Exclusive events', 'Premium benefits'];
      default:
        return [];
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
          <Crown className="w-6 h-6 text-yellow-400" />
          <h2 className="text-2xl font-bold text-white">Loyalty & Referrals</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-sm text-gray-400">Tier</div>
            <div className={`text-lg font-bold ${getTierColor(loyaltyStats.tier)}`}>
              {loyaltyStats.tier}
            </div>
          </div>
          <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            {getTierIcon(loyaltyStats.tier)}
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
          onClick={() => setActiveTab('referrals')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'referrals'
              ? 'bg-primary text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          Referrals
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
          {/* Tier Progress */}
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Loyalty Tier</h3>
              <span className={`text-2xl font-bold ${getTierColor(loyaltyStats.tier)}`}>
                {loyaltyStats.tier}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
              <div
                className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${(loyaltyStats.points / loyaltyStats.nextTierPoints) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-300">
              <span>{loyaltyStats.points} points</span>
              <span>{loyaltyStats.nextTierPoints - loyaltyStats.points} points to next tier</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 p-4 rounded-lg border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="w-5 h-5 text-yellow-400" />
                <span className="text-sm text-gray-300">Total Points</span>
              </div>
              <div className="text-2xl font-bold text-white">{loyaltyStats.totalEarned}</div>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="w-5 h-5 text-green-400" />
                <span className="text-sm text-gray-300">Points Redeemed</span>
              </div>
              <div className="text-2xl font-bold text-white">{loyaltyStats.totalRedeemed}</div>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-gray-300">Referrals</span>
              </div>
              <div className="text-2xl font-bold text-white">{loyaltyStats.referrals}</div>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <span className="text-sm text-gray-300">Lifetime Value</span>
              </div>
              <div className="text-2xl font-bold text-white">${loyaltyStats.lifetimeValue}</div>
            </div>
          </div>

          {/* Tier Benefits */}
          <div className="bg-gray-800/50 rounded-lg border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Your {loyaltyStats.tier} Benefits</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getTierBenefits(loyaltyStats.tier).map((benefit, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Referrals Tab */}
      {activeTab === 'referrals' && (
        <div className="space-y-6">
          {/* Referral Code */}
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-500/30 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Your Referral Code</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 p-3 bg-gray-800 rounded-lg border border-white/10">
                <code className="text-white font-mono text-lg">{referralCode}</code>
              </div>
              <button
                onClick={copyReferralCode}
                className="flex items-center gap-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
              >
                {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedCode ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex-1 p-3 bg-gray-800 rounded-lg border border-white/10">
                <code className="text-white font-mono text-sm break-all">{referralLink}</code>
              </div>
              <button
                onClick={copyReferralLink}
                className="flex items-center gap-2 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedLink ? 'Copied!' : 'Copy Link'}
              </button>
              <button
                onClick={shareReferral}
                className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>

          {/* Referral Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800/50 p-4 rounded-lg border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <UserPlus className="w-5 h-5 text-green-400" />
                <span className="text-sm text-gray-300">Successful Referrals</span>
              </div>
              <div className="text-2xl font-bold text-white">{loyaltyStats.referrals}</div>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="w-5 h-5 text-yellow-400" />
                <span className="text-sm text-gray-300">Referral Earnings</span>
              </div>
              <div className="text-2xl font-bold text-white">{loyaltyStats.referralEarnings} pts</div>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Percent className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-gray-300">Conversion Rate</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {loyaltyStats.referrals > 0 ? Math.round((loyaltyStats.referrals / 10) * 100) : 0}%
              </div>
            </div>
          </div>

          {/* Referral List */}
          <div className="bg-gray-800/50 rounded-lg border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Your Referrals</h3>
            {referrals.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No referrals yet</p>
                <p className="text-sm text-gray-500">Share your referral code to start earning!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {referrals.map((referral) => (
                  <div key={referral.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                        {referral.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{referral.name}</div>
                        <div className="text-sm text-gray-400">
                          Joined {new Date(referral.joinedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-semibold">+{referral.pointsEarned} pts</div>
                      <div className="text-sm text-gray-400">
                        {referral.status === 'active' ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rewards Tab */}
      {activeTab === 'rewards' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Available Rewards</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.map((reward) => {
              const canRedeem = loyaltyStats.points >= reward.cost;
              
              return (
                <div
                  key={reward.id}
                  className={`p-4 rounded-lg border transition-all ${
                    canRedeem
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-white/10 bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Gift className="w-6 h-6 text-yellow-400" />
                    <span className="font-semibold text-white">{reward.name}</span>
                  </div>
                  <p className="text-sm text-gray-300 mb-3">{reward.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Coins className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-semibold">{reward.cost} points</span>
                    </div>
                    <button
                      onClick={() => redeemReward(reward.id)}
                      disabled={!canRedeem}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        canRedeem
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {canRedeem ? 'Redeem' : 'Not enough points'}
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

export default ReferralLoyalty;
