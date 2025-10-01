import React, { useState, useEffect, useMemo } from 'react';
import { Camera, Star, Users, Volume2, Eye, Zap, Info } from 'lucide-react';
import ARSeatPreview from './ARSeatPreview';

const SmartSeatSelector = ({ showId, onSeatSelect, selectedSeats = [] }) => {
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAR, setShowAR] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [filters, setFilters] = useState({
    priceRange: [0, 100],
    accessibility: false,
    groupSize: 1,
    preferences: []
  });

  // Mock seat data - replace with actual API call
  useEffect(() => {
    const generateSeats = () => {
      const seatData = [];
      const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
      
      rows.forEach((row, rowIndex) => {
        for (let seatNum = 1; seatNum <= 20; seatNum++) {
          const distance = Math.sqrt(Math.pow(rowIndex - 5, 2) + Math.pow(seatNum - 10, 2));
          const basePrice = 15;
          const priceMultiplier = 1 + (distance * 0.1);
          const price = Math.round(basePrice * priceMultiplier);
          
          seatData.push({
            id: `${row}${seatNum}`,
            number: seatNum,
            row: row,
            x: seatNum,
            y: rowIndex,
            price: price,
            available: Math.random() > 0.3,
            accessibility: rowIndex === 0 || rowIndex === 9, // First and last rows
            soundQuality: Math.max(0, 10 - distance),
            viewAngle: Math.max(0, 90 - (Math.abs(seatNum - 10) * 5)),
            groupFriendly: seatNum % 2 === 0
          });
        }
      });
      
      return seatData;
    };

    setSeats(generateSeats());
    setLoading(false);
  }, [showId]);

  // AI-powered seat recommendations
  const calculateRecommendations = useMemo(() => {
    if (!seats.length) return [];

    const scoredSeats = seats
      .filter(seat => seat.available)
      .map(seat => {
        let score = 0;
        
        // Price score (lower is better)
        const maxPrice = Math.max(...seats.map(s => s.price));
        score += (1 - seat.price / maxPrice) * 30;
        
        // Sound quality score
        score += (seat.soundQuality / 10) * 25;
        
        // View angle score
        score += (seat.viewAngle / 90) * 25;
        
        // Accessibility score
        if (filters.accessibility && seat.accessibility) {
          score += 20;
        }
        
        // Group-friendly score
        if (filters.groupSize > 1 && seat.groupFriendly) {
          score += 15;
        }
        
        // Distance from center (optimal viewing distance)
        const optimalDistance = 5;
        const distanceScore = Math.max(0, 10 - Math.abs(seat.y - optimalDistance));
        score += distanceScore * 2;
        
        return { ...seat, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return scoredSeats;
  }, [seats, filters]);

  const handleSeatClick = (seat) => {
    if (!seat.available) return;
    
    setSelectedSeat(seat);
    setShowAR(true);
  };

  const confirmSeatSelection = (seat) => {
    onSeatSelect(seat);
    setShowAR(false);
    setSelectedSeat(null);
  };

  const getSeatColor = (seat) => {
    if (!seat.available) return 'bg-gray-600';
    if (selectedSeats.some(s => s.id === seat.id)) return 'bg-blue-600';
    if (recommendations.some(r => r.id === seat.id)) return 'bg-green-500';
    return 'bg-gray-300 hover:bg-gray-400';
  };

  const getSeatIcon = (seat) => {
    if (seat.accessibility) return '♿';
    if (seat.groupFriendly) return '👥';
    if (seat.soundQuality > 8) return '🔊';
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Recommendations */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-600" />
          AI-Powered Seat Recommendations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.slice(0, 3).map((seat, index) => (
            <div
              key={seat.id}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleSeatClick(seat)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-800">Seat {seat.id}</span>
                <span className="text-sm text-gray-500">#{index + 1} Pick</span>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>Score: {Math.round(seat.score)}/100</span>
                </div>
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-green-500" />
                  <span>Sound: {seat.soundQuality}/10</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-500" />
                  <span>View: {seat.viewAngle}°</span>
                </div>
                <div className="text-right font-semibold text-blue-600">
                  ${seat.price}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-3">Smart Filters</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={filters.priceRange[1]}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                priceRange: [prev.priceRange[0], parseInt(e.target.value)]
              }))}
              className="w-full"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="accessibility"
              checked={filters.accessibility}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                accessibility: e.target.checked
              }))}
              className="mr-2"
            />
            <label htmlFor="accessibility" className="text-sm text-gray-700">
              Accessibility
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Group Size: {filters.groupSize}
            </label>
            <select
              value={filters.groupSize}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                groupSize: parseInt(e.target.value)
              }))}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value={1}>1 person</option>
              <option value={2}>2 people</option>
              <option value={3}>3 people</option>
              <option value={4}>4+ people</option>
            </select>
          </div>
          <div className="flex items-center">
            <button
              onClick={() => setShowAR(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Camera className="w-4 h-4" />
              AR Preview
            </button>
          </div>
        </div>
      </div>

      {/* Seat Map */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-800">Theater Layout</h4>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-300 rounded"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-600 rounded"></div>
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Recommended</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-600 rounded"></div>
              <span>Occupied</span>
            </div>
          </div>
        </div>

        {/* Screen */}
        <div className="text-center mb-4">
          <div className="inline-block bg-gray-800 text-white px-8 py-2 rounded-lg">
            🎬 SCREEN 🎬
          </div>
        </div>

        {/* Seats Grid */}
        <div className="grid grid-cols-20 gap-1 max-w-4xl mx-auto">
          {seats.map((seat) => (
            <button
              key={seat.id}
              onClick={() => handleSeatClick(seat)}
              disabled={!seat.available}
              className={`
                relative w-8 h-8 rounded text-xs font-medium transition-all duration-200
                ${getSeatColor(seat)}
                ${seat.available ? 'hover:scale-110 cursor-pointer' : 'cursor-not-allowed'}
                ${selectedSeats.some(s => s.id === seat.id) ? 'ring-2 ring-blue-400' : ''}
              `}
              title={`Seat ${seat.id} - $${seat.price} - Score: ${Math.round(seat.score || 0)}`}
            >
              {seat.number}
              {getSeatIcon(seat) && (
                <span className="absolute -top-1 -right-1 text-xs">
                  {getSeatIcon(seat)}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 text-xs text-gray-500 text-center">
          <p>♿ = Accessibility | 👥 = Group Friendly | 🔊 = Great Sound</p>
        </div>
      </div>

      {/* AR Preview Modal */}
      {showAR && selectedSeat && (
        <ARSeatPreview
          isOpen={showAR}
          onClose={() => setShowAR(false)}
          seatData={selectedSeat}
          theaterLayout={{ width: 20, height: 10 }}
          onConfirm={confirmSeatSelection}
        />
      )}
    </div>
  );
};

export default SmartSeatSelector;
