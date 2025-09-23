import React, { useState, useEffect } from 'react';
import { FaBrain, FaStar, FaClock, FaUsers, FaMapMarkerAlt, FaHeart, FaEye, FaArrowUp, FaFilter, FaSync, FaChevronRight, FaChevronLeft } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const SmartRecommendations = ({ userId, onRecommendationSelect, onTheatreSelect }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [theatreRecommendations, setTheatreRecommendations] = useState([]);
  const [showtimeRecommendations, setShowtimeRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('movies');
  const [filters, setFilters] = useState({
    mood: 'all',
    time: 'all',
    budget: 'all',
    group: 'solo'
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchRecommendations();
    }
  }, [userId, filters]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      // Simulate API calls for different recommendation types
      await Promise.all([
        fetchMovieRecommendations(),
        fetchTheatreRecommendations(),
        fetchShowtimeRecommendations()
      ]);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMovieRecommendations = async () => {
    const mockMovies = [
      {
        id: 1,
        title: 'Avatar: The Way of Water',
        genre: 'Sci-Fi',
        rating: 8.2,
        duration: '192 min',
        releaseDate: '2022-12-16',
        image: 'https://img.freepik.com/free-photo/movie-poster_144627-16135.jpg?w=400',
        matchScore: 95,
        reasons: ['Matches your sci-fi preference', 'High rating (8.2/10)', 'New release'],
        price: 250,
        showtimes: ['10:30 AM', '2:00 PM', '6:30 PM', '10:00 PM'],
        isTrending: true,
        isNew: true,
        mood: 'adventure',
        budget: 'premium'
      },
      {
        id: 2,
        title: 'Top Gun: Maverick',
        genre: 'Action',
        rating: 8.7,
        duration: '131 min',
        releaseDate: '2022-05-27',
        image: 'https://img.freepik.com/free-photo/action-movie-poster_144627-16136.jpg?w=400',
        matchScore: 88,
        reasons: ['Action genre match', 'Excellent rating', 'Popular choice'],
        price: 200,
        showtimes: ['11:00 AM', '3:30 PM', '7:00 PM'],
        isTrending: true,
        isNew: false,
        mood: 'thrilling',
        budget: 'standard'
      },
      {
        id: 3,
        title: 'The Batman',
        genre: 'Action',
        rating: 7.8,
        duration: '176 min',
        releaseDate: '2022-03-04',
        image: 'https://img.freepik.com/free-photo/batman-movie-poster_144627-16137.jpg?w=400',
        matchScore: 82,
        reasons: ['Dark action theme', 'Good rating', 'Long runtime'],
        price: 220,
        showtimes: ['12:30 PM', '4:00 PM', '8:30 PM'],
        isTrending: false,
        isNew: false,
        mood: 'dark',
        budget: 'premium'
      }
    ];

    await new Promise(resolve => setTimeout(resolve, 800));
    setRecommendations(mockMovies);
  };

  const fetchTheatreRecommendations = async () => {
    const mockTheatres = [
      {
        id: 1,
        name: 'PVR Cinemas',
        location: 'Phoenix MarketCity',
        distance: '2.5 km',
        rating: 4.5,
        amenities: ['IMAX', 'Dolby Atmos', 'Recliner Seats'],
        priceRange: '₹200-₹400',
        matchScore: 92,
        reasons: ['Close to your location', 'IMAX available', 'High rating'],
        image: 'https://img.freepik.com/free-photo/modern-cinema-theater_144627-16138.jpg?w=400',
        isRecommended: true
      },
      {
        id: 2,
        name: 'INOX Megaplex',
        location: 'Forum Mall',
        distance: '3.2 km',
        rating: 4.3,
        amenities: ['4DX', 'Dolby Vision', 'Food Court'],
        priceRange: '₹180-₹350',
        matchScore: 85,
        reasons: ['4DX experience', 'Good amenities', 'Reasonable pricing'],
        image: 'https://img.freepik.com/free-photo/cinema-hall_144627-16139.jpg?w=400',
        isRecommended: false
      }
    ];

    await new Promise(resolve => setTimeout(resolve, 600));
    setTheatreRecommendations(mockTheatres);
  };

  const fetchShowtimeRecommendations = async () => {
    const mockShowtimes = [
      {
        id: 1,
        time: '6:30 PM',
        theatre: 'PVR Cinemas',
        movie: 'Avatar: The Way of Water',
        price: 250,
        occupancy: 0.3,
        matchScore: 90,
        reasons: ['Perfect evening time', 'Low occupancy', 'Good pricing'],
        isOptimal: true
      },
      {
        id: 2,
        time: '2:00 PM',
        theatre: 'INOX Megaplex',
        movie: 'Top Gun: Maverick',
        price: 200,
        occupancy: 0.6,
        matchScore: 78,
        reasons: ['Afternoon slot', 'Medium occupancy', 'Standard pricing'],
        isOptimal: false
      }
    ];

    await new Promise(resolve => setTimeout(resolve, 400));
    setShowtimeRecommendations(mockShowtimes);
  };

  const getMatchColor = (score) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-yellow-400';
    if (score >= 70) return 'text-orange-400';
    return 'text-red-400';
  };

  const getMatchIcon = (score) => {
    if (score >= 90) return <FaStar className="text-yellow-400" />;
    if (score >= 80) return <FaArrowUp className="text-green-400" />;
    return <FaClock className="text-blue-400" />;
  };

  const nextRecommendation = () => {
    const maxIndex = recommendations.length - 1;
    setCurrentIndex(prev => prev >= maxIndex ? 0 : prev + 1);
  };

  const prevRecommendation = () => {
    const maxIndex = recommendations.length - 1;
    setCurrentIndex(prev => prev <= 0 ? maxIndex : prev - 1);
  };

  const tabs = [
    { id: 'movies', name: 'Movies', icon: <FaEye /> },
    { id: 'theatres', name: 'Theatres', icon: <FaMapMarkerAlt /> },
    { id: 'showtimes', name: 'Showtimes', icon: <FaClock /> }
  ];

  const getCurrentRecommendations = () => {
    switch (activeTab) {
      case 'movies': return recommendations;
      case 'theatres': return theatreRecommendations;
      case 'showtimes': return showtimeRecommendations;
      default: return [];
    }
  };

  const currentRecommendations = getCurrentRecommendations();

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg">
            <FaBrain className="text-primary text-xl" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Smart Recommendations</h3>
            <p className="text-gray-400 text-sm">AI-powered personalized suggestions</p>
          </div>
        </div>
        
        <button
          onClick={fetchRecommendations}
          disabled={loading}
          className="p-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          <FaSync className={loading ? 'animate-spin' : ''} />
        </button>
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

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <select
          value={filters.mood}
          onChange={(e) => setFilters(prev => ({ ...prev, mood: e.target.value }))}
          className="px-3 py-2 bg-gray-800 border border-white/10 rounded-lg text-white text-sm"
        >
          <option value="all">All Moods</option>
          <option value="adventure">Adventure</option>
          <option value="thrilling">Thrilling</option>
          <option value="romantic">Romantic</option>
          <option value="comedy">Comedy</option>
        </select>
        
        <select
          value={filters.time}
          onChange={(e) => setFilters(prev => ({ ...prev, time: e.target.value }))}
          className="px-3 py-2 bg-gray-800 border border-white/10 rounded-lg text-white text-sm"
        >
          <option value="all">Any Time</option>
          <option value="morning">Morning</option>
          <option value="afternoon">Afternoon</option>
          <option value="evening">Evening</option>
          <option value="night">Night</option>
        </select>
        
        <select
          value={filters.budget}
          onChange={(e) => setFilters(prev => ({ ...prev, budget: e.target.value }))}
          className="px-3 py-2 bg-gray-800 border border-white/10 rounded-lg text-white text-sm"
        >
          <option value="all">Any Budget</option>
          <option value="budget">Budget (₹100-₹200)</option>
          <option value="standard">Standard (₹200-₹300)</option>
          <option value="premium">Premium (₹300+)</option>
        </select>
      </div>

      {/* Recommendations */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-gray-800/50 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {activeTab === 'movies' && (
            <div className="relative">
              <AnimatePresence mode="wait">
                {currentRecommendations.length > 0 && (
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="bg-gray-800/30 rounded-xl p-6 border border-white/10"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="text-xl font-bold text-white">
                              {currentRecommendations[currentIndex]?.title}
                            </h4>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                              <span>{currentRecommendations[currentIndex]?.genre}</span>
                              <span>•</span>
                              <span>{currentRecommendations[currentIndex]?.duration}</span>
                              <span>•</span>
                              <span>{currentRecommendations[currentIndex]?.releaseDate}</span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="flex items-center gap-2 mb-1">
                              {getMatchIcon(currentRecommendations[currentIndex]?.matchScore)}
                              <span className={`text-2xl font-bold ${getMatchColor(currentRecommendations[currentIndex]?.matchScore)}`}>
                                {currentRecommendations[currentIndex]?.matchScore}
                              </span>
                            </div>
                            <div className="text-sm text-gray-400">Match Score</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-1">
                            <FaStar className="text-yellow-400" />
                            <span className="text-white font-medium">
                              {currentRecommendations[currentIndex]?.rating}
                            </span>
                          </div>
                          <div className="text-primary font-bold">
                            ₹{currentRecommendations[currentIndex]?.price}
                          </div>
                          {currentRecommendations[currentIndex]?.isTrending && (
                            <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded-full border border-red-500/30">
                              Trending
                            </span>
                          )}
                          {currentRecommendations[currentIndex]?.isNew && (
                            <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-500/30">
                              New
                            </span>
                          )}
                        </div>
                        
                        <div className="mb-4">
                          <div className="text-sm text-gray-300 font-medium mb-2">Why this movie?</div>
                          <div className="flex flex-wrap gap-2">
                            {currentRecommendations[currentIndex]?.reasons.map((reason, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-primary/15 text-primary text-xs rounded-full border border-primary/30"
                              >
                                {reason}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => onRecommendationSelect(currentRecommendations[currentIndex])}
                            className="px-6 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg font-semibold transition-colors"
                          >
                            Book Now
                          </button>
                          <button
                            onClick={() => setShowDetails(!showDetails)}
                            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {currentRecommendations.length > 1 && (
                <div className="flex items-center justify-center gap-4 mt-4">
                  <button
                    onClick={prevRecommendation}
                    className="p-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <FaChevronLeft />
                  </button>
                  <span className="text-sm text-gray-400">
                    {currentIndex + 1} of {currentRecommendations.length}
                  </span>
                  <button
                    onClick={nextRecommendation}
                    className="p-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <FaChevronRight />
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'theatres' && (
            <div className="space-y-4">
              {currentRecommendations.map((theatre, index) => (
                <motion.div
                  key={theatre.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800/30 rounded-xl p-4 border border-white/10 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-lg font-bold text-white">{theatre.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <FaMapMarkerAlt />
                            <span>{theatre.location}</span>
                            <span>•</span>
                            <span>{theatre.distance}</span>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-1">
                            {getMatchIcon(theatre.matchScore)}
                            <span className={`text-xl font-bold ${getMatchColor(theatre.matchScore)}`}>
                              {theatre.matchScore}
                            </span>
                          </div>
                          <div className="text-sm text-gray-400">Match Score</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-1">
                          <FaStar className="text-yellow-400" />
                          <span className="text-white font-medium">{theatre.rating}</span>
                        </div>
                        <div className="text-primary font-bold">{theatre.priceRange}</div>
                        {theatre.isRecommended && (
                          <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-500/30">
                            Recommended
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {theatre.amenities.map((amenity, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                      
                      <div className="mb-3">
                        <div className="text-sm text-gray-300 font-medium mb-1">Why this theatre?</div>
                        <div className="flex flex-wrap gap-2">
                          {theatre.reasons.map((reason, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-primary/15 text-primary text-xs rounded-full border border-primary/30"
                            >
                              {reason}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => onTheatreSelect(theatre)}
                        className="px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg font-semibold transition-colors"
                      >
                        Select Theatre
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'showtimes' && (
            <div className="space-y-4">
              {currentRecommendations.map((showtime, index) => (
                <motion.div
                  key={showtime.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-xl border transition-colors ${
                    showtime.isOptimal
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-gray-800/30 border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-lg font-bold text-white">{showtime.time}</h4>
                      <div className="text-sm text-gray-400">
                        {showtime.theatre} • {showtime.movie}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        {getMatchIcon(showtime.matchScore)}
                        <span className={`text-xl font-bold ${getMatchColor(showtime.matchScore)}`}>
                          {showtime.matchScore}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400">Match Score</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-3">
                    <div className="text-primary font-bold">₹{showtime.price}</div>
                    <div className="flex items-center gap-2">
                      <FaUsers />
                      <span className="text-sm text-gray-300">
                        {Math.round(showtime.occupancy * 100)}% occupied
                      </span>
                    </div>
                    {showtime.isOptimal && (
                      <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-500/30">
                        Optimal Time
                      </span>
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <div className="text-sm text-gray-300 font-medium mb-1">Why this showtime?</div>
                    <div className="flex flex-wrap gap-2">
                      {showtime.reasons.map((reason, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-primary/15 text-primary text-xs rounded-full border border-primary/30"
                        >
                          {reason}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => onRecommendationSelect(showtime)}
                    className="px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg font-semibold transition-colors"
                  >
                    Book This Showtime
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* AI Insights */}
      <div className="mt-6 p-4 bg-gray-800/30 rounded-xl border border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <FaBrain className="text-primary" />
          <span className="text-sm font-medium text-gray-300">AI Insights</span>
        </div>
        <p className="text-xs text-gray-400">
          Our AI analyzes your viewing history, preferences, and real-time data to provide personalized recommendations. 
          The match score indicates how well each option aligns with your preferences.
        </p>
      </div>
    </div>
  );
};

export default SmartRecommendations;
