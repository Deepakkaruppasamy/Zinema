import React, { useState, useEffect, useRef } from 'react';
import { FaChair, FaWheelchair, FaCrown, FaEye, FaUsers, FaInfoCircle, FaSearchPlus, FaSearchMinus, FaUndo, FaRedo, FaExpand, FaCompress } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const InteractiveSeatMap = ({ 
  showId, 
  onSeatSelect, 
  selectedSeats = [], 
  onSeatsChange,
  maxSeats = 4,
  allowGroupBooking = true 
}) => {
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('2d'); // 2d, 3d, view
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [showLegend, setShowLegend] = useState(true);
  const [hoveredSeat, setHoveredSeat] = useState(null);
  const [seatDetails, setSeatDetails] = useState(null);
  const [viewFromSeat, setViewFromSeat] = useState(null);
  const [groupMode, setGroupMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    if (showId) {
      generateSeatMap();
    }
  }, [showId]);

  const generateSeatMap = async () => {
    setLoading(true);
    try {
      // Generate a realistic seat map
      const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
      const seatsPerRow = 20;
      const aislePositions = [5, 6, 13, 14]; // Aisles after seats 5, 6, 13, 14
      
      const generatedSeats = [];
      
      rows.forEach((row, rowIndex) => {
        for (let seatNum = 1; seatNum <= seatsPerRow; seatNum++) {
          if (aislePositions.includes(seatNum)) continue; // Skip aisle positions
          
          const seatId = `${row}${seatNum}`;
          const isAisle = aislePositions.includes(seatNum);
          const isWheelchair = row === 'L' && seatNum <= 4; // Last row, first 4 seats
          const isPremium = row === 'A' || row === 'B'; // First two rows
          const isVIP = row === 'A' && seatNum >= 8 && seatNum <= 13; // Center of first row
          
          // Random availability (80% available)
          const isAvailable = Math.random() > 0.2;
          const isBooked = !isAvailable && Math.random() > 0.5;
          
          generatedSeats.push({
            id: seatId,
            row: row,
            number: seatNum,
            type: isVIP ? 'vip' : isPremium ? 'premium' : 'standard',
            isAvailable: isAvailable,
            isBooked: isBooked,
            isWheelchair: isWheelchair,
            isAisle: isAisle,
            price: isVIP ? 350 : isPremium ? 250 : 200,
            viewQuality: calculateViewQuality(rowIndex, seatNum, seatsPerRow),
            legroom: isPremium ? 'extra' : 'standard',
            features: getSeatFeatures(rowIndex, seatNum, isVIP, isPremium, isWheelchair)
          });
        }
      });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSeats(generatedSeats);
    } catch (error) {
      console.error('Error generating seat map:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateViewQuality = (rowIndex, seatNum, totalSeats) => {
    const centerDistance = Math.abs(seatNum - (totalSeats / 2));
    const rowScore = Math.max(0, 10 - rowIndex * 0.5); // Closer rows = better score
    const centerScore = Math.max(0, 10 - centerDistance * 0.3); // Center seats = better score
    
    return Math.min(10, (rowScore + centerScore) / 2);
  };

  const getSeatFeatures = (rowIndex, seatNum, isVIP, isPremium, isWheelchair) => {
    const features = [];
    
    if (isVIP) features.push('VIP', 'Extra Legroom', 'Center View');
    else if (isPremium) features.push('Premium', 'Extra Legroom');
    else features.push('Standard');
    
    if (isWheelchair) features.push('Wheelchair Accessible');
    if (rowIndex <= 2) features.push('Close to Screen');
    if (rowIndex >= 8) features.push('Wide View');
    if (seatNum >= 8 && seatNum <= 13) features.push('Center View');
    
    return features;
  };

  const handleSeatClick = (seat) => {
    if (!seat.isAvailable || seat.isBooked) return;
    
    if (groupMode && selectedSeats.length < maxSeats) {
      // Group booking - select multiple seats
      const newSelectedSeats = [...selectedSeats, seat.id];
      onSeatsChange(newSelectedSeats);
    } else if (!groupMode) {
      // Single seat selection
      onSeatsChange([seat.id]);
    }
  };

  const handleSeatHover = (seat) => {
    setHoveredSeat(seat);
    setSeatDetails(seat);
  };

  const getSeatColor = (seat) => {
    if (selectedSeats.includes(seat.id)) return 'bg-primary border-primary';
    if (seat.isBooked) return 'bg-red-500/60 border-red-500';
    if (!seat.isAvailable) return 'bg-gray-600 border-gray-600';
    if (seat.type === 'vip') return 'bg-purple-500/60 border-purple-500 hover:bg-purple-500/80';
    if (seat.type === 'premium') return 'bg-yellow-500/60 border-yellow-500 hover:bg-yellow-500/80';
    return 'bg-blue-500/60 border-blue-500 hover:bg-blue-500/80';
  };

  const getSeatIcon = (seat) => {
    if (seat.isWheelchair) return <FaWheelchair />;
    if (seat.type === 'vip') return <FaCrown />;
    return <FaChair />;
  };

  const toggleViewMode = () => {
    const modes = ['2d', '3d', 'view'];
    const currentIndex = modes.indexOf(viewMode);
    setViewMode(modes[(currentIndex + 1) % modes.length]);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      mapRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const resetView = () => {
    setZoom(1);
    setRotation(0);
  };

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
            <FaChair className="text-primary text-xl" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Interactive Seat Map</h3>
            <p className="text-gray-400 text-sm">
              {viewMode === '2d' ? '2D View' : viewMode === '3d' ? '3D View' : 'View from Seat'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setGroupMode(!groupMode)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              groupMode ? 'bg-primary text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <FaUsers className="mr-2" />
            {groupMode ? 'Group Mode' : 'Single Mode'}
          </button>
          
          <button
            onClick={toggleViewMode}
            className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
          >
            {viewMode === '2d' ? '2D' : viewMode === '3d' ? '3D' : 'View'}
          </button>
          
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
          >
            {isFullscreen ? <FaCompress /> : <FaExpand />}
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
              className="p-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <FaSearchMinus />
            </button>
            <span className="text-sm text-gray-300 min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(Math.min(2, zoom + 0.1))}
              className="p-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <FaSearchPlus />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setRotation(rotation - 15)}
              className="p-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <FaUndo />
            </button>
            <button
              onClick={() => setRotation(rotation + 15)}
              className="p-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <FaRedo />
            </button>
          </div>
          
          <button
            onClick={resetView}
            className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Reset View
          </button>
        </div>
        
        <button
          onClick={() => setShowLegend(!showLegend)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <FaInfoCircle />
          Legend
        </button>
      </div>

      {/* Seat Map */}
      <div 
        ref={mapRef}
        className="relative bg-gray-800/30 rounded-xl p-6 overflow-hidden"
        style={{
          transform: `scale(${zoom}) rotate(${rotation}deg)`,
          transformOrigin: 'center'
        }}
      >
        {/* Screen */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-r from-gray-700 to-gray-600 text-white px-8 py-3 rounded-lg font-bold text-lg">
            🎬 SCREEN 🎬
          </div>
        </div>

        {/* Seats Grid */}
        <div className="grid grid-cols-20 gap-1 justify-center">
          {seats.map((seat) => (
            <motion.div
              key={seat.id}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center text-xs font-bold cursor-pointer transition-all duration-200 ${getSeatColor(seat)}`}
              onClick={() => handleSeatClick(seat)}
              onMouseEnter={() => handleSeatHover(seat)}
              onMouseLeave={() => setHoveredSeat(null)}
              title={`${seat.id} - ₹${seat.price} - ${seat.type}`}
            >
              {getSeatIcon(seat)}
            </motion.div>
          ))}
        </div>

        {/* Aisles */}
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-2 h-32 bg-gray-600 rounded"></div>
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-2 h-32 bg-gray-600 rounded ml-16"></div>
      </div>

      {/* Legend */}
      <AnimatePresence>
        {showLegend && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 p-4 bg-gray-800/30 rounded-xl"
          >
            <h4 className="text-lg font-semibold text-white mb-3">Seat Types</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-purple-500/60 border-purple-500 rounded flex items-center justify-center">
                  <FaCrown className="text-xs" />
                </div>
                <span className="text-sm text-gray-300">VIP (₹350)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-yellow-500/60 border-yellow-500 rounded flex items-center justify-center">
                  <FaChair className="text-xs" />
                </div>
                <span className="text-sm text-gray-300">Premium (₹250)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-500/60 border-blue-500 rounded flex items-center justify-center">
                  <FaChair className="text-xs" />
                </div>
                <span className="text-sm text-gray-300">Standard (₹200)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-red-500/60 border-red-500 rounded flex items-center justify-center">
                  <FaChair className="text-xs" />
                </div>
                <span className="text-sm text-gray-300">Booked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-primary border-primary rounded flex items-center justify-center">
                  <FaChair className="text-xs" />
                </div>
                <span className="text-sm text-gray-300">Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-500/60 border-green-500 rounded flex items-center justify-center">
                  <FaWheelchair className="text-xs" />
                </div>
                <span className="text-sm text-gray-300">Wheelchair</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Seat Details */}
      <AnimatePresence>
        {seatDetails && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-6 p-4 bg-gray-800/30 rounded-xl border border-white/10"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-white">Seat {seatDetails.id}</h4>
              <button
                onClick={() => setSeatDetails(null)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-400 mb-1">Price</div>
                <div className="text-xl font-bold text-primary">₹{seatDetails.price}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">View Quality</div>
                <div className="text-lg font-bold text-white">{seatDetails.viewQuality}/10</div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Type</div>
                <div className="text-sm font-medium text-white capitalize">{seatDetails.type}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Legroom</div>
                <div className="text-sm font-medium text-white capitalize">{seatDetails.legroom}</div>
              </div>
            </div>
            
            <div className="mt-3">
              <div className="text-sm text-gray-400 mb-2">Features</div>
              <div className="flex flex-wrap gap-1">
                {seatDetails.features.map((feature, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-primary/15 text-primary text-xs rounded-full border border-primary/30"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Seats Summary */}
      {selectedSeats.length > 0 && (
        <div className="mt-6 p-4 bg-primary/10 rounded-xl border border-primary/30">
          <h4 className="text-lg font-semibold text-white mb-3">Selected Seats</h4>
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedSeats.map(seatId => {
              const seat = seats.find(s => s.id === seatId);
              return (
                <span
                  key={seatId}
                  className="px-3 py-1 bg-primary text-white rounded-full text-sm font-medium"
                >
                  {seatId} (₹{seat?.price})
                </span>
              );
            })}
          </div>
          <div className="text-lg font-bold text-white">
            Total: ₹{selectedSeats.reduce((total, seatId) => {
              const seat = seats.find(s => s.id === seatId);
              return total + (seat?.price || 0);
            }, 0)}
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveSeatMap;
