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
  Play
} from 'lucide-react';

const MovieComparison = ({ onClose }) => {
  const [selectedMovies, setSelectedMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [comparisonData, setComparisonData] = useState(null);

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
    
    const results = mockMovies.filter(movie =>
      movie.title.toLowerCase().includes(query.toLowerCase()) ||
      movie.director.toLowerCase().includes(query.toLowerCase()) ||
      movie.cast.some(actor => actor.toLowerCase().includes(query.toLowerCase()))
    );
    
    setSearchResults(results);
  };

  const addMovie = (movie) => {
    if (selectedMovies.length >= 4) {
      alert('Maximum 4 movies can be compared at once');
      return;
    }
    
    if (selectedMovies.some(m => m.id === movie.id)) {
      alert('Movie already added to comparison');
      return;
    }
    
    setSelectedMovies(prev => [...prev, movie]);
    setSearchQuery('');
    setSearchResults([]);
    setShowSearch(false);
  };

  const removeMovie = (movieId) => {
    setSelectedMovies(prev => prev.filter(m => m.id !== movieId));
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
      <div className="bg-white rounded-xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Movie Comparison</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Movie
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                placeholder="Search movies, directors, or actors..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  {searchResults.map(movie => (
                    <button
                      key={movie.id}
                      onClick={() => addMovie(movie)}
                      className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={movie.poster}
                          alt={movie.title}
                          className="w-12 h-16 object-cover rounded"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{movie.title}</p>
                          <p className="text-sm text-gray-600">{movie.year} • {movie.director}</p>
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
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No movies selected</h3>
              <p className="text-gray-600 mb-4">Add movies to start comparing</p>
              <button
                onClick={() => setShowSearch(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Your First Movie
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Movie Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {selectedMovies.map(movie => (
                  <div key={movie.id} className="bg-gray-50 rounded-lg p-4 relative">
                    <button
                      onClick={() => removeMovie(movie.id)}
                      className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="w-full h-48 object-cover rounded-lg mb-3"
                    />
                    <h3 className="font-semibold text-gray-900 mb-1">{movie.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{movie.year}</p>
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{movie.rating}</span>
                    </div>
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
                <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Share2 className="w-4 h-4" />
                  Share Comparison
                </button>
                <button className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <Download className="w-4 h-4" />
                  Export PDF
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
