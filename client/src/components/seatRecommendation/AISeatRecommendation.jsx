import React, { useState, useEffect } from 'react';
import { Brain, Star, DollarSign, Users, Eye, Zap, Target, Crown } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const AISeatRecommendation = ({ showId, occupiedSeats = [], onSeatSelect, userPreferences = {} }) => {
  const { axios, getToken, user } = useAppContext();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    priceSensitivity: 'medium', // low, medium, high
    viewPreference: 'center', // front, center, back
    seatType: 'standard', // standard, premium, aisle
    groupSize: 1,
    accessibility: false,
    ...userPreferences
  });

  const seatRows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const seatColumns = Array.from({ length: 12 }, (_, i) => i + 1);
  const totalSeats = seatRows.length * seatColumns.length;

  // AI recommendation algorithm
  const calculateSeatScore = (row, col) => {
    const seatId = `${row}${col}`;
    if (occupiedSeats.includes(seatId)) return 0;

    let score = 0;
    const rowIndex = seatRows.indexOf(row);
    const isAisle = col === 6 || col === 7; // Center aisle
    const isPremium = rowIndex >= 6; // Back rows are premium
    const isFront = rowIndex <= 2;
    const isCenter = rowIndex >= 3 && rowIndex <= 5;

    // View preference scoring
    switch (preferences.viewPreference) {
      case 'front':
        score += isFront ? 30 : (isCenter ? 20 : 10);
        break;
      case 'center':
        score += isCenter ? 30 : (isFront ? 20 : 15);
        break;
      case 'back':
        score += isPremium ? 30 : (isCenter ? 20 : 15);
        break;
    }

    // Seat type preference
    if (preferences.seatType === 'aisle' && isAisle) score += 25;
    if (preferences.seatType === 'premium' && isPremium) score += 25;
    if (preferences.seatType === 'standard' && !isPremium && !isAisle) score += 20;

    // Price sensitivity
    const basePrice = isPremium ? 15 : 10;
    const priceMultiplier = preferences.priceSensitivity === 'low' ? 1.2 : 
                           preferences.priceSensitivity === 'high' ? 0.8 : 1.0;
    const priceScore = (20 - basePrice * priceMultiplier) * 2;
    score += Math.max(0, priceScore);

    // Accessibility
    if (preferences.accessibility && (isAisle || rowIndex >= 8)) score += 15;

    // Group seating (prefer contiguous seats)
    if (preferences.groupSize > 1) {
      const adjacentSeats = checkAdjacentSeats(row, col, preferences.groupSize);
      score += adjacentSeats * 10;
    }

    // Popularity factor (center seats are generally more popular)
    const centerDistance = Math.abs(col - 6.5);
    score += (6 - centerDistance) * 2;

    // Avoid edge seats unless specifically requested
    if (col === 1 || col === 12) score -= 5;

    return Math.max(0, Math.min(100, score));
  };

  const checkAdjacentSeats = (row, col, groupSize) => {
    let availableAdjacent = 0;
    for (let i = 0; i < groupSize - 1; i++) {
      const nextCol = col + i + 1;
      if (nextCol <= 12 && !occupiedSeats.includes(`${row}${nextCol}`)) {
        availableAdjacent++;
      }
    }
    return availableAdjacent;
  };

  const generateRecommendations = () => {
    const seatScores = [];
    
    seatRows.forEach(row => {
      seatColumns.forEach(col => {
        const score = calculateSeatScore(row, col);
        if (score > 0) {
          seatScores.push({
            seatId: `${row}${col}`,
            row,
            col,
            score,
            price: row >= 6 ? 15 : 10,
            isPremium: row >= 6,
            isAisle: col === 6 || col === 7,
            viewQuality: getViewQuality(row, col),
            availability: 'available'
          });
        }
      });
    });

    // Sort by score and take top recommendations
    const sortedSeats = seatScores.sort((a, b) => b.score - a.score);
    const topRecommendations = sortedSeats.slice(0, 8);

    // Group recommendations by type
    const grouped = {
      best: topRecommendations.filter(s => s.score >= 80),
      good: topRecommendations.filter(s => s.score >= 60 && s.score < 80),
      budget: topRecommendations.filter(s => s.price <= 10),
      premium: topRecommendations.filter(s => s.isPremium)
    };

    setRecommendations(grouped);
  };

  const getViewQuality = (row, col) => {
    const rowIndex = seatRows.indexOf(row);
    const centerDistance = Math.abs(col - 6.5);
    
    if (rowIndex <= 2) return 'Excellent (Front)';
    if (rowIndex >= 3 && rowIndex <= 5) return 'Great (Center)';
    if (rowIndex >= 6 && rowIndex <= 8) return 'Good (Back)';
    return 'Fair (Rear)';
  };

  const getRecommendationIcon = (type) => {
    switch (type) {
      case 'best': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'good': return <Star className="w-4 h-4 text-blue-500" />;
      case 'budget': return <DollarSign className="w-4 h-4 text-green-500" />;
      case 'premium': return <Crown className="w-4 h-4 text-purple-500" />;
      default: return <Target className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRecommendationColor = (type) => {
    switch (type) {
      case 'best': return 'border-yellow-500 bg-yellow-500/10';
      case 'good': return 'border-blue-500 bg-blue-500/10';
      case 'budget': return 'border-green-500 bg-green-500/10';
      case 'premium': return 'border-purple-500 bg-purple-500/10';
      default: return 'border-gray-500 bg-gray-500/10';
    }
  };

  useEffect(() => {
    generateRecommendations();
  }, [occupiedSeats, preferences]);

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleSeatClick = (seatId) => {
    if (onSeatSelect) {
      onSeatSelect(seatId);
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Brain Header */}
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg border border-purple-500/30">
        <Brain className="w-6 h-6 text-purple-400" />
        <div>
          <h3 className="text-lg font-semibold text-white">AI Seat Recommendations</h3>
          <p className="text-sm text-gray-300">Powered by machine learning to find your perfect seats</p>
        </div>
      </div>

      {/* Preference Settings */}
      <div className="bg-gray-800/50 p-4 rounded-lg border border-white/10">
        <h4 className="text-md font-semibold mb-4 text-white">Your Preferences</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">View Preference</label>
            <select
              value={preferences.viewPreference}
              onChange={(e) => handlePreferenceChange('viewPreference', e.target.value)}
              className="w-full p-2 bg-gray-700 border border-white/10 rounded-lg text-white"
            >
              <option value="front">Front Row</option>
              <option value="center">Center View</option>
              <option value="back">Back Row</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Seat Type</label>
            <select
              value={preferences.seatType}
              onChange={(e) => handlePreferenceChange('seatType', e.target.value)}
              className="w-full p-2 bg-gray-700 border border-white/10 rounded-lg text-white"
            >
              <option value="standard">Standard</option>
              <option value="premium">Premium</option>
              <option value="aisle">Aisle Seat</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Price Sensitivity</label>
            <select
              value={preferences.priceSensitivity}
              onChange={(e) => handlePreferenceChange('priceSensitivity', e.target.value)}
              className="w-full p-2 bg-gray-700 border border-white/10 rounded-lg text-white"
            >
              <option value="low">Low (Premium)</option>
              <option value="medium">Medium</option>
              <option value="high">High (Budget)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Group Size</label>
            <select
              value={preferences.groupSize}
              onChange={(e) => handlePreferenceChange('groupSize', parseInt(e.target.value))}
              className="w-full p-2 bg-gray-700 border border-white/10 rounded-lg text-white"
            >
              {[1, 2, 3, 4, 5].map(size => (
                <option key={size} value={size}>{size} {size === 1 ? 'person' : 'people'}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={preferences.accessibility}
              onChange={(e) => handlePreferenceChange('accessibility', e.target.checked)}
              className="rounded border-white/10 bg-gray-700"
            />
            Accessibility needs
          </label>
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-4">
        {Object.entries(recommendations).map(([type, seats]) => {
          if (seats.length === 0) return null;
          
          return (
            <div key={type} className="space-y-2">
              <div className="flex items-center gap-2">
                {getRecommendationIcon(type)}
                <h4 className="text-md font-semibold text-white capitalize">
                  {type} Seats ({seats.length})
                </h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {seats.map((seat) => (
                  <div
                    key={seat.seatId}
                    className={`p-3 rounded-lg border cursor-pointer transition-all hover:scale-105 ${getRecommendationColor(type)}`}
                    onClick={() => handleSeatClick(seat.seatId)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono font-bold text-lg">{seat.seatId}</span>
                      <div className="flex items-center gap-1">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-semibold">{seat.score}%</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Price:</span>
                        <span className="text-green-400 font-semibold">${seat.price}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">View:</span>
                        <span className="text-blue-400">{seat.viewQuality}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Type:</span>
                        <span className="text-purple-400">
                          {seat.isPremium ? 'Premium' : 'Standard'}
                          {seat.isAisle ? ' (Aisle)' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Insights */}
      <div className="bg-gray-800/50 p-4 rounded-lg border border-white/10">
        <h4 className="text-md font-semibold mb-3 text-white flex items-center gap-2">
          <Eye className="w-5 h-5 text-blue-400" />
          AI Insights
        </h4>
        <div className="space-y-2 text-sm text-gray-300">
          <p>• Based on your preferences, we recommend seats with optimal view-to-price ratio</p>
          <p>• Popular seats are often booked quickly - consider booking soon</p>
          <p>• Aisle seats provide easier access but may have slightly obstructed views</p>
          <p>• Premium seats offer enhanced comfort and better viewing angles</p>
        </div>
      </div>
    </div>
  );
};

export default AISeatRecommendation;
