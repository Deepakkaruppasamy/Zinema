import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  X, 
  Star, 
  Clock, 
  Calendar, 
  Users, 
  DollarSign, 
  Award,
  TrendingUp,
  Heart,
  Share2,
  Download,
  Play,
  Sparkles,
  Zap,
  Eye,
  ThumbsUp,
  MessageCircle,
  Bookmark,
  RotateCcw,
  Shuffle
} from 'lucide-react';

const MovieComparison = ({ onClose }) => {
  const [selectedMovies, setSelectedMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [comparisonData, setComparisonData] = useState(null);
  const [hoveredMovie, setHoveredMovie] = useState(null);
  const [animationKey, setAnimationKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showTips, setShowTips] = useState(true);
  const [favorites, setFavorites] = useState(new Set());
  const [recentSearches, setRecentSearches] = useState([]);

  // Mock movie data - replace with actual API call
  const mockMovies = [
    {
      id: 1,
      title: 'Inception',
      year: 2010,
      director: 'Christopher Nolan',
      cast: ['Leonardo DiCaprio', 'Marion Cotillard', 'Tom Hardy'],
      genre: ['Sci-Fi', 'Thriller'],
      rating: 8.8,
      duration: 148,
      budget: 160000000,
      boxOffice: 836836967,
      awards: ['Oscar Winner', 'BAFTA Winner'],
      plot: 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
      poster: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
      trailer: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
      imdbRating: 8.8,
      rottenTomatoes: 87,
      metacritic: 74
    },
    {
      id: 2,
      title: 'Interstellar',
      year: 2014,
      director: 'Christopher Nolan',
      cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain'],
      genre: ['Sci-Fi', 'Drama'],
      rating: 8.6,
      duration: 169,
      budget: 165000000,
      boxOffice: 677463813,
      awards: ['Oscar Winner'],
      plot: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
      poster: 'https://image.tmdb.org/t/p/w500/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg',
      trailer: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
      imdbRating: 8.6,
      rottenTomatoes: 72,
      metacritic: 74
    },
    {
      id: 3,
      title: 'The Dark Knight',
      year: 2008,
      director: 'Christopher Nolan',
      cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart'],
      genre: ['Action', 'Crime', 'Drama'],
      rating: 9.0,
      duration: 152,
      budget: 185000000,
      boxOffice: 1004558444,
      awards: ['Oscar Winner', 'Golden Globe Winner'],
      plot: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
      poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
      trailer: 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
      imdbRating: 9.0,
      rottenTomatoes: 94,
      metacritic: 84
    }
  ];

  const handleSearch = (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API delay for better UX
    setTimeout(() => {
      const results = mockMovies.filter(movie =>
        movie.title.toLowerCase().includes(query.toLowerCase()) ||
        movie.director.toLowerCase().includes(query.toLowerCase()) ||
        movie.cast.some(actor => actor.toLowerCase().includes(query.toLowerCase()))
      );
      
      setSearchResults(results);
      setIsLoading(false);
      
      // Add to recent searches
      if (query && !recentSearches.includes(query)) {
        setRecentSearches(prev => [query, ...prev.slice(0, 4)]);
      }
    }, 500);
  };

  const addMovie = (movie) => {
    if (selectedMovies.length >= 4) {
      // Show animated notification instead of alert
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-bounce';
      notification.textContent = 'Maximum 4 movies can be compared at once';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
      return;
    }
    
    if (selectedMovies.some(m => m.id === movie.id)) {
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-bounce';
      notification.textContent = 'Movie already added to comparison';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
      return;
    }
    
    setSelectedMovies(prev => [...prev, movie]);
    setSearchQuery('');
    setSearchResults([]);
    setShowSearch(false);
    setAnimationKey(prev => prev + 1);
    
    // Success animation
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-bounce';
    notification.textContent = `${movie.title} added to comparison!`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  };

  const removeMovie = (movieId) => {
    setSelectedMovies(prev => prev.filter(m => m.id !== movieId));
    setAnimationKey(prev => prev + 1);
  };

  const toggleFavorite = (movieId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(movieId)) {
        newFavorites.delete(movieId);
      } else {
        newFavorites.add(movieId);
      }
      return newFavorites;
    });
  };

  const shuffleMovies = () => {
    const shuffled = [...selectedMovies].sort(() => Math.random() - 0.5);
    setSelectedMovies(shuffled);
    setAnimationKey(prev => prev + 1);
  };

  const clearAll = () => {
    setSelectedMovies([]);
    setAnimationKey(prev => prev + 1);
  };

  const generateComparison = () => {
    if (selectedMovies.length < 2) return;
    
    // Calculate comparison metrics
    const comparison = {
      averageRating: selectedMovies.reduce((sum, movie) => sum + movie.rating, 0) / selectedMovies.length,
      totalDuration: selectedMovies.reduce((sum, movie) => sum + movie.duration, 0),
      totalBudget: selectedMovies.reduce((sum, movie) => sum + movie.budget, 0),
      totalBoxOffice: selectedMovies.reduce((sum, movie) => sum + movie.boxOffice, 0),
      commonGenres: findCommonGenres(selectedMovies),
      commonCast: findCommonCast(selectedMovies),
      recommendations: generateRecommendations(selectedMovies)
    };
    
    setComparisonData(comparison);
  };

  const findCommonGenres = (movies) => {
    const allGenres = movies.flatMap(movie => movie.genre);
    const genreCount = allGenres.reduce((acc, genre) => {
      acc[genre] = (acc[genre] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(genreCount)
      .filter(([_, count]) => count > 1)
      .map(([genre, count]) => ({ genre, count }));
  };

  const findCommonCast = (movies) => {
    const allCast = movies.flatMap(movie => movie.cast);
    const castCount = allCast.reduce((acc, actor) => {
      acc[actor] = (acc[actor] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(castCount)
      .filter(([_, count]) => count > 1)
      .map(([actor, count]) => ({ actor, count }));
  };

  const generateRecommendations = (movies) => {
    const commonGenres = findCommonGenres(movies);
    const avgRating = movies.reduce((sum, movie) => sum + movie.rating, 0) / movies.length;
    
    return [
      `Based on your selection, you might enjoy ${commonGenres[0]?.genre || 'Sci-Fi'} movies`,
      `Movies with rating ${avgRating.toFixed(1)}+ would match your taste`,
      `Consider exploring ${movies[0]?.director}'s other works`
    ];
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  useEffect(() => {
    if (selectedMovies.length >= 2) {
      generateComparison();
    }
  }, [selectedMovies]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-7xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Movie Comparison</h2>
              <p className="text-sm text-gray-600">Compare up to 4 movies side-by-side</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {selectedMovies.length > 0 && (
              <>
                <button
                  onClick={shuffleMovies}
                  className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-all duration-200 hover:scale-105"
                  title="Shuffle movies"
                >
                  <Shuffle className="w-4 h-4" />
                </button>
                <button
                  onClick={clearAll}
                  className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all duration-200 hover:scale-105"
                  title="Clear all"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 hover:scale-105 shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Add Movie
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors hover:bg-gray-100 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200 animate-in slide-in-from-top-2 duration-300">
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Quick Search</span>
                {recentSearches.length > 0 && (
                  <div className="flex items-center gap-1 ml-auto">
                    <span className="text-xs text-gray-500">Recent:</span>
                    {recentSearches.slice(0, 3).map((search, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSearchQuery(search);
                          handleSearch(search);
                        }}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                placeholder="Search movies, directors, or actors..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
              />
              {isLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                </div>
              )}
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl z-10 max-h-60 overflow-y-auto animate-in slide-in-from-top-2 duration-200">
                  {searchResults.map((movie, index) => (
                    <button
                      key={movie.id}
                      onClick={() => addMovie(movie)}
                      className="w-full p-3 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors duration-200 hover:scale-[1.02]"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={movie.poster}
                          alt={movie.title}
                          className="w-12 h-16 object-cover rounded shadow-sm"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{movie.title}</p>
                          <p className="text-sm text-gray-600">{movie.year} • {movie.director}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500 fill-current" />
                              <span className="text-xs text-gray-600">{movie.rating}</span>
                            </div>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-600">{movie.genre.join(', ')}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(movie.id);
                            }}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            <Heart 
                              className={`w-4 h-4 ${favorites.has(movie.id) ? 'text-red-500 fill-current' : 'text-gray-400'}`} 
                            />
                          </button>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Selected Movies */}
        <div className="p-6">
          {selectedMovies.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Plus className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No movies selected</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">Add movies to start comparing and discover insights about your favorite films</p>
              <button
                onClick={() => setShowSearch(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-105 shadow-lg"
              >
                <Plus className="w-5 h-5 inline mr-2" />
                Add Your First Movie
              </button>
              {showTips && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg max-w-md mx-auto">
                  <div className="flex items-start gap-2">
                    <MessageCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-blue-900">💡 Pro Tip</p>
                      <p className="text-xs text-blue-700">Try searching for movies by director, actor, or genre to find interesting comparisons!</p>
                    </div>
                    <button
                      onClick={() => setShowTips(false)}
                      className="text-blue-400 hover:text-blue-600 ml-auto"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6" key={animationKey}>
              {/* Movie Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {selectedMovies.map((movie, index) => (
                  <div 
                    key={movie.id} 
                    className="bg-white rounded-xl p-4 relative shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-105 group"
                    style={{ animationDelay: `${index * 100}ms` }}
                    onMouseEnter={() => setHoveredMovie(movie.id)}
                    onMouseLeave={() => setHoveredMovie(null)}
                  >
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button
                        onClick={() => toggleFavorite(movie.id)}
                        className="p-1.5 rounded-full bg-white/80 hover:bg-white shadow-sm transition-all duration-200 hover:scale-110"
                        title="Add to favorites"
                      >
                        <Heart 
                          className={`w-4 h-4 ${favorites.has(movie.id) ? 'text-red-500 fill-current' : 'text-gray-400'}`} 
                        />
                      </button>
                      <button
                        onClick={() => removeMovie(movie.id)}
                        className="p-1.5 rounded-full bg-white/80 hover:bg-red-100 text-gray-400 hover:text-red-600 shadow-sm transition-all duration-200 hover:scale-110"
                        title="Remove from comparison"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="relative overflow-hidden rounded-lg mb-3">
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <button className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
                          <Play className="w-6 h-6 text-gray-800" />
                        </button>
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{movie.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{movie.year} • {movie.director}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{movie.rating}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{formatDuration(movie.duration)}</span>
                      </div>
                    </div>
                    {hoveredMovie === movie.id && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-white text-xs">
                        <p className="line-clamp-2">{movie.plot}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Comparison Table */}
              {selectedMovies.length >= 2 && (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Detailed Comparison</h3>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Movie
                          </th>
                          {selectedMovies.map(movie => (
                            <th key={movie.id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {movie.title}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <div className="flex items-center gap-2">
                              <Star className="w-4 h-4 text-yellow-500" />
                              Rating
                            </div>
                          </td>
                          {selectedMovies.map(movie => (
                            <td key={movie.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                              {movie.rating}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-blue-500" />
                              Duration
                            </div>
                          </td>
                          {selectedMovies.map(movie => (
                            <td key={movie.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                              {formatDuration(movie.duration)}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-green-500" />
                              Budget
                            </div>
                          </td>
                          {selectedMovies.map(movie => (
                            <td key={movie.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                              {formatCurrency(movie.budget)}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-purple-500" />
                              Box Office
                            </div>
                          </td>
                          {selectedMovies.map(movie => (
                            <td key={movie.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                              {formatCurrency(movie.boxOffice)}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <div className="flex items-center gap-2">
                              <Award className="w-4 h-4 text-yellow-500" />
                              Awards
                            </div>
                          </td>
                          {selectedMovies.map(movie => (
                            <td key={movie.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                              {movie.awards.length}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Comparison Insights */}
              {comparisonData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Statistics */}
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h4 className="text-lg font-semibold text-blue-900 mb-4">Comparison Stats</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Average Rating:</span>
                        <span className="font-semibold text-blue-900">
                          {comparisonData.averageRating.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Total Duration:</span>
                        <span className="font-semibold text-blue-900">
                          {formatDuration(comparisonData.totalDuration)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Total Budget:</span>
                        <span className="font-semibold text-blue-900">
                          {formatCurrency(comparisonData.totalBudget)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Total Box Office:</span>
                        <span className="font-semibold text-blue-900">
                          {formatCurrency(comparisonData.totalBoxOffice)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Common Elements */}
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h4 className="text-lg font-semibold text-green-900 mb-4">Common Elements</h4>
                    <div className="space-y-3">
                      {comparisonData.commonGenres.length > 0 && (
                        <div>
                          <p className="text-green-700 font-medium">Shared Genres:</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {comparisonData.commonGenres.map(({ genre, count }) => (
                              <span key={genre} className="px-2 py-1 bg-green-200 text-green-800 rounded text-sm">
                                {genre} ({count})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {comparisonData.commonCast.length > 0 && (
                        <div>
                          <p className="text-green-700 font-medium">Shared Cast:</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {comparisonData.commonCast.map(({ actor, count }) => (
                              <span key={actor} className="px-2 py-1 bg-green-200 text-green-800 rounded text-sm">
                                {actor} ({count})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {comparisonData?.recommendations && (
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h4 className="text-lg font-semibold text-purple-900 mb-4">Personalized Recommendations</h4>
                  <div className="space-y-2">
                    {comparisonData.recommendations.map((rec, index) => (
                      <p key={index} className="text-purple-700">
                        • {rec}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-center gap-4">
                <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 hover:scale-105 shadow-lg">
                  <Share2 className="w-4 h-4" />
                  Share Comparison
                </button>
                <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 hover:scale-105 shadow-lg">
                  <Download className="w-4 h-4" />
                  Export PDF
                </button>
                <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 hover:scale-105 shadow-lg">
                  <Bookmark className="w-4 h-4" />
                  Save Comparison
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieComparison;
