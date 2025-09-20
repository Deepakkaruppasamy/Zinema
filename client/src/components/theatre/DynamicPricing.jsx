import React, { useState, useEffect } from 'react';
import { FaChartLine, FaClock, FaUsers, FaStar, FaTag, FaArrowUp, FaArrowDown, FaInfoCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const DynamicPricing = ({ showId, basePrice = 200, onPriceChange }) => {
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [priceHistory, setPriceHistory] = useState([]);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (showId) {
      fetchDynamicPricing();
    }
  }, [showId]);

  const fetchDynamicPricing = async () => {
    setLoading(true);
    try {
      // Simulate API call to get dynamic pricing
      const mockPricing = {
        basePrice: basePrice,
        finalPrice: Math.round(basePrice * 1.3), // 30% premium for demo
        multipliers: {
          time: 1.2,      // Peak hours
          demand: 1.1,    // High demand
          movie: 1.0,     // Standard movie
          seat: 1.0,      // Standard seat
          seasonal: 1.0   // Normal season
        },
        factors: {
          occupancyRate: 0.75,
          trend: 'increasing',
          timeToShow: 2.5, // hours
          popularityScore: 8.5
        },
        recommendations: {
          optimal: Math.round(basePrice * 1.3),
          aggressive: Math.round(basePrice * 0.8),
          premium: Math.round(basePrice * 1.5)
        },
        suggestions: [
          {
            type: 'discount',
            message: 'Low occupancy detected - consider offering discounts',
            recommendedAction: 'Reduce price by 10-15%'
          },
          {
            type: 'premium',
            message: 'High demand detected - premium pricing recommended',
            recommendedAction: 'Increase price by 10-20%'
          }
        ]
      };

      // Generate price history for the last 24 hours
      const history = generatePriceHistory(basePrice);
      setPriceHistory(history);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPricing(mockPricing);
      
      if (onPriceChange) {
        onPriceChange(mockPricing.finalPrice);
      }
    } catch (error) {
      console.error('Error fetching dynamic pricing:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePriceHistory = (base) => {
    const history = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hour = time.getHours();
      
      // Simulate price fluctuations based on time of day
      let multiplier = 1.0;
      if (hour >= 18 && hour <= 22) multiplier = 1.3; // Peak hours
      else if (hour >= 12 && hour <= 17) multiplier = 1.1; // Afternoon
      else if (hour >= 6 && hour <= 11) multiplier = 0.9; // Morning
      else multiplier = 0.8; // Late night
      
      const price = Math.round(base * multiplier);
      history.push({
        time: time.toISOString(),
        price: price,
        hour: hour
      });
    }
    
    return history;
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing': return <FaArrowUp className="text-green-400" />;
      case 'decreasing': return <FaArrowDown className="text-red-400" />;
      default: return <FaChartLine className="text-blue-400" />;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'increasing': return 'text-green-400';
      case 'decreasing': return 'text-red-400';
      default: return 'text-blue-400';
    }
  };

  const getOccupancyColor = (rate) => {
    if (rate >= 0.8) return 'text-red-400';
    if (rate >= 0.5) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getOccupancyLabel = (rate) => {
    if (rate >= 0.8) return 'High Demand';
    if (rate >= 0.5) return 'Medium Demand';
    return 'Low Demand';
  };

  if (loading) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-800/50 rounded"></div>
          <div className="h-20 bg-gray-800/50 rounded"></div>
          <div className="h-32 bg-gray-800/50 rounded"></div>
        </div>
      </div>
    );
  }

  if (!pricing) return null;

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg">
            <FaChartLine className="text-primary text-xl" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Dynamic Pricing</h3>
            <p className="text-gray-400 text-sm">Real-time price optimization</p>
          </div>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
        >
          <FaInfoCircle className="text-gray-400" />
        </button>
      </div>

      {/* Price Display */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 bg-gray-800/30 rounded-xl">
          <div className="text-sm text-gray-400 mb-1">Base Price</div>
          <div className="text-2xl font-bold text-gray-300">₹{pricing.basePrice}</div>
        </div>
        <div className="text-center p-4 bg-primary/20 rounded-xl border border-primary/30">
          <div className="text-sm text-primary mb-1">Current Price</div>
          <div className="text-2xl font-bold text-primary">₹{pricing.finalPrice}</div>
        </div>
      </div>

      {/* Price Factors */}
      <div className="space-y-4 mb-6">
        <h4 className="text-lg font-semibold text-white">Price Factors</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-gray-800/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FaClock className="text-blue-400" />
              <span className="text-sm text-gray-300">Time Factor</span>
            </div>
            <div className="text-lg font-bold text-white">
              {pricing.multipliers.time > 1 ? '+' : ''}{Math.round((pricing.multipliers.time - 1) * 100)}%
            </div>
          </div>
          <div className="p-3 bg-gray-800/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FaUsers className="text-green-400" />
              <span className="text-sm text-gray-300">Demand Factor</span>
            </div>
            <div className="text-lg font-bold text-white">
              {pricing.multipliers.demand > 1 ? '+' : ''}{Math.round((pricing.multipliers.demand - 1) * 100)}%
            </div>
          </div>
          <div className="p-3 bg-gray-800/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FaStar className="text-yellow-400" />
              <span className="text-sm text-gray-300">Movie Factor</span>
            </div>
            <div className="text-lg font-bold text-white">
              {pricing.multipliers.movie > 1 ? '+' : ''}{Math.round((pricing.multipliers.movie - 1) * 100)}%
            </div>
          </div>
          <div className="p-3 bg-gray-800/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FaTag className="text-purple-400" />
              <span className="text-sm text-gray-300">Seasonal Factor</span>
            </div>
            <div className="text-lg font-bold text-white">
              {pricing.multipliers.seasonal > 1 ? '+' : ''}{Math.round((pricing.multipliers.seasonal - 1) * 100)}%
            </div>
          </div>
        </div>
      </div>

      {/* Demand Status */}
      <div className="p-4 bg-gray-800/30 rounded-xl mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-300">Current Demand</span>
          <div className="flex items-center gap-2">
            {getTrendIcon(pricing.factors.trend)}
            <span className={`text-sm font-medium ${getTrendColor(pricing.factors.trend)}`}>
              {pricing.factors.trend}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Occupancy Rate</span>
          <span className={`text-sm font-bold ${getOccupancyColor(pricing.factors.occupancyRate)}`}>
            {Math.round(pricing.factors.occupancyRate * 100)}% - {getOccupancyLabel(pricing.factors.occupancyRate)}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              pricing.factors.occupancyRate >= 0.8 ? 'bg-red-400' :
              pricing.factors.occupancyRate >= 0.5 ? 'bg-yellow-400' : 'bg-green-400'
            }`}
            style={{ width: `${pricing.factors.occupancyRate * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Price History Chart */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-white mb-3">Price History (24h)</h4>
        <div className="h-32 bg-gray-800/30 rounded-xl p-4">
          <div className="flex items-end justify-between h-full gap-1">
            {priceHistory.map((point, index) => {
              const maxPrice = Math.max(...priceHistory.map(p => p.price));
              const height = (point.price / maxPrice) * 100;
              const isPeak = point.hour >= 18 && point.hour <= 22;
              
              return (
                <div
                  key={index}
                  className={`flex-1 rounded-t transition-all duration-300 ${
                    isPeak ? 'bg-primary' : 'bg-gray-600'
                  }`}
                  style={{ height: `${height}%` }}
                  title={`${point.hour}:00 - ₹${point.price}`}
                ></div>
              );
            })}
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>24h ago</span>
          <span>Now</span>
        </div>
      </div>

      {/* Recommendations */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <h4 className="text-lg font-semibold text-white">Price Recommendations</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-green-500/20 rounded-lg border border-green-500/30">
                <div className="text-sm text-green-300 mb-1">Aggressive</div>
                <div className="text-lg font-bold text-green-400">₹{pricing.recommendations.aggressive}</div>
                <div className="text-xs text-gray-400">Low occupancy</div>
              </div>
              <div className="p-3 bg-primary/20 rounded-lg border border-primary/30">
                <div className="text-sm text-primary mb-1">Optimal</div>
                <div className="text-lg font-bold text-primary">₹{pricing.recommendations.optimal}</div>
                <div className="text-xs text-gray-400">Current market</div>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-lg border border-purple-500/30">
                <div className="text-sm text-purple-300 mb-1">Premium</div>
                <div className="text-lg font-bold text-purple-400">₹{pricing.recommendations.premium}</div>
                <div className="text-xs text-gray-400">High demand</div>
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="text-sm font-medium text-gray-300">AI Suggestions</h5>
              {pricing.suggestions.map((suggestion, index) => (
                <div key={index} className="p-3 bg-gray-800/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      suggestion.type === 'discount' ? 'bg-green-400' : 'bg-yellow-400'
                    }`}></div>
                    <div>
                      <div className="text-sm text-gray-300">{suggestion.message}</div>
                      <div className="text-xs text-gray-400 mt-1">{suggestion.recommendedAction}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DynamicPricing;
