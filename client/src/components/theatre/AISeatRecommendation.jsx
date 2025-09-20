import React, { useState, useEffect } from 'react';
import { FaBrain, FaStar, FaUsers, FaEye, FaDollarSign, FaClock, FaHeart } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const AISeatRecommendation = ({ showId, onSeatSelect, userPreferences = {} }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (showId) {
      fetchSeatRecommendations();
    }
  }, [showId, userPreferences]);

  const fetchSeatRecommendations = async () => {
    setLoading(true);
    try {
      // Simulate API call to get AI recommendations
      const mockRecommendations = [
        {
          id: 1,
          seat: 'E8',
          score: 95,
          reasons: ['Perfect center view', 'Matches your preference for middle rows', 'Great value for money'],
          features: ['Center view', 'Optimal distance', 'Standard pricing'],
          price: 250,
          seatType: 'premium',
          viewQuality: 9.5,
          socialScore: 8.5,
          priceScore: 9.0,
          availability: 'available'
        },
        {
          id: 2,
          seat: 'E9',
          score: 92,
          reasons: ['Excellent center view', 'Matches your social preference', 'Good for group viewing'],
          features: ['Center view', 'Group friendly', 'Standard pricing'],
          price: 250,
          seatType: 'premium',
          viewQuality: 9.2,
          socialScore: 9.0,
          priceScore: 9.0,
          availability: 'available'
        },
        {
          id: 3,
          seat: 'F7',
          score: 88,
          reasons: ['Good center view', 'Matches your budget preference', 'Comfortable seating'],
          features: ['Near center', 'Budget friendly', 'Comfortable'],
          price: 200,
          seatType: 'standard',
          viewQuality: 8.5,
          socialScore: 7.5,
          priceScore: 9.5,
          availability: 'available'
        },
        {
          id: 4,
          seat: 'D10',
          score: 85,
          reasons: ['Premium seating', 'Matches your luxury preference', 'Excellent legroom'],
          features: ['Premium seating', 'Extra legroom', 'VIP experience'],
          price: 350,
          seatType: 'vip',
          viewQuality: 9.0,
          socialScore: 8.0,
          priceScore: 7.5,
          availability: 'available'
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setRecommendations(mockRecommendations);
    } catch (error) {
      console.error('Error fetching seat recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-yellow-400';
    if (score >= 70) return 'text-orange-400';
    return 'text-red-400';
  };

  const getSeatTypeColor = (type) => {
    switch (type) {
      case 'vip': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'premium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'standard': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getScoreIcon = (score) => {
    if (score >= 90) return <FaStar className="text-yellow-400" />;
    if (score >= 80) return <FaHeart className="text-red-400" />;
    return <FaClock className="text-blue-400" />;
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/20 rounded-lg">
          <FaBrain className="text-primary text-xl" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">AI Seat Recommendations</h3>
          <p className="text-gray-400 text-sm">Powered by machine learning algorithms</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-gray-800/50 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {recommendations.map((rec, index) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className={`relative p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                  selectedRecommendation?.id === rec.id
                    ? 'border-primary bg-primary/10 scale-105'
                    : 'border-white/10 bg-gray-800/30 hover:border-primary/50 hover:bg-primary/5'
                }`}
                onClick={() => {
                  setSelectedRecommendation(rec);
                  onSeatSelect(rec);
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${getSeatTypeColor(rec.seatType)}`}>
                      {rec.seat}
                    </div>
                    <div className="flex items-center gap-2">
                      {getScoreIcon(rec.score)}
                      <span className={`text-2xl font-bold ${getScoreColor(rec.score)}`}>
                        {rec.score}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">₹{rec.price}</div>
                    <div className="text-xs text-gray-400">per seat</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-sm text-gray-300">
                      <FaEye className="text-blue-400" />
                      <span>{rec.viewQuality}/10</span>
                    </div>
                    <div className="text-xs text-gray-500">View Quality</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-sm text-gray-300">
                      <FaUsers className="text-green-400" />
                      <span>{rec.socialScore}/10</span>
                    </div>
                    <div className="text-xs text-gray-500">Social Score</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-sm text-gray-300">
                      <FaDollarSign className="text-yellow-400" />
                      <span>{rec.priceScore}/10</span>
                    </div>
                    <div className="text-xs text-gray-500">Value Score</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-gray-300 font-medium">Why this seat?</div>
                  <div className="flex flex-wrap gap-2">
                    {rec.reasons.map((reason, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-primary/15 text-primary text-xs rounded-full border border-primary/30"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedRecommendation?.id === rec.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 pt-4 border-t border-white/10"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium text-gray-300 mb-2">Features</div>
                        <div className="space-y-1">
                          {rec.features.map((feature, idx) => (
                            <div key={idx} className="text-xs text-gray-400 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-300 mb-2">Availability</div>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            rec.availability === 'available' ? 'bg-green-400' : 'bg-red-400'
                          }`}></div>
                          <span className="text-xs text-gray-400 capitalize">{rec.availability}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-800/30 rounded-xl border border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <FaBrain className="text-primary" />
          <span className="text-sm font-medium text-gray-300">AI Analysis</span>
        </div>
        <p className="text-xs text-gray-400">
          Our AI analyzes your preferences, viewing history, and real-time data to recommend the best seats for your movie experience.
        </p>
      </div>
    </div>
  );
};

export default AISeatRecommendation;
