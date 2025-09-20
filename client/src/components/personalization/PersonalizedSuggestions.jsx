import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Star, 
  TrendingUp, 
  Clock, 
  Heart, 
  Eye,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Filter,
  Sparkles
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import MovieCard from '../MovieCard';
import toast from 'react-hot-toast';

const PersonalizedSuggestions = () => {
  const { axios, getToken, user } = useAppContext();
  const [suggestions, setSuggestions] = useState({
    trending: [],
    recommended: [],
    similar: [],
    newReleases: [],
    topRated: []
  });
  const [userPreferences, setUserPreferences] = useState({
    genres: [],
    languages: [],
    ratingRange: [0, 10],
    yearRange: [1990, new Date().getFullYear()],
    runtimeRange: [60, 240]
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recommended');
  const [feedback, setFeedback] = useState({});

  useEffect(() => {
    if (user) {
      loadPersonalizedSuggestions();
      loadUserPreferences();
    }
  }, [user]);

  const loadUserPreferences = async () => {
    try {
      const { data } = await axios.get('/api/user/preferences', {
        headers: { Authorization: `Bearer ${await getToken()}` }
      });
      
      if (data.success) {
        setUserPreferences(prev => ({ ...prev, ...data.preferences }));
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const loadPersonalizedSuggestions = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/discovery/personalized', {
        headers: { Authorization: `Bearer ${await getToken()}` }
      });
      
      if (data.success) {
        setSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error('Error loading suggestions:', error);
      // Fallback to basic suggestions
      loadBasicSuggestions();
    } finally {
      setLoading(false);
    }
  };

  const loadBasicSuggestions = async () => {
    try {
      const { data } = await axios.get('/api/show/all');
      const movies = data.shows || [];
      
      // Basic categorization
      const now = new Date();
      const recentMovies = movies.filter(movie => {
        const releaseDate = new Date(movie.release_date);
        const daysDiff = (now - releaseDate) / (1000 * 60 * 60 * 24);
        return daysDiff <= 30;
      });
      
      const topRated = movies
        .filter(movie => movie.vote_average >= 7.5)
        .sort((a, b) => b.vote_average - a.vote_average)
        .slice(0, 10);
      
      setSuggestions({
        trending: movies.slice(0, 10),
        recommended: topRated.slice(0, 8),
        similar: movies.slice(0, 6),
        newReleases: recentMovies.slice(0, 8),
        topRated: topRated.slice(0, 10)
      });
    } catch (error) {
      console.error('Error loading basic suggestions:', error);
    }
  };

  const handleFeedback = async (movieId, type) => {
    try {
      await axios.post('/api/user/feedback', {
        movieId,
        type, // 'like', 'dislike', 'view'
        timestamp: new Date()
      }, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      });
      
      setFeedback(prev => ({ ...prev, [movieId]: type }));
      toast.success('Feedback recorded!');
      
      // Refresh suggestions based on feedback
      setTimeout(() => {
        loadPersonalizedSuggestions();
      }, 1000);
    } catch (error) {
      console.error('Error recording feedback:', error);
    }
  };

  const updatePreferences = async (newPreferences) => {
    try {
      await axios.post('/api/user/preferences', newPreferences, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      });
      
      setUserPreferences(prev => ({ ...prev, ...newPreferences }));
      toast.success('Preferences updated!');
      
      // Refresh suggestions
      loadPersonalizedSuggestions();
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  const getTabContent = () => {
    const movies = suggestions[activeTab] || [];
    
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }
    
    if (movies.length === 0) {
      return (
        <div className="text-center py-12">
          <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">No suggestions available</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {movies.map((movie) => (
          <div key={movie._id} className="relative group">
            <MovieCard movie={movie} />
            
            {/* Feedback Buttons */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex gap-1">
                <button
                  onClick={() => handleFeedback(movie._id, 'like')}
                  className={`p-1 rounded-full transition-colors ${
                    feedback[movie._id] === 'like' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-black/50 text-white hover:bg-green-600'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleFeedback(movie._id, 'dislike')}
                  className={`p-1 rounded-full transition-colors ${
                    feedback[movie._id] === 'dislike' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-black/50 text-white hover:bg-red-600'
                  }`}
                >
                  <ThumbsDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const tabs = [
    { id: 'recommended', label: 'For You', icon: Brain, count: suggestions.recommended?.length || 0 },
    { id: 'trending', label: 'Trending', icon: TrendingUp, count: suggestions.trending?.length || 0 },
    { id: 'newReleases', label: 'New Releases', icon: Clock, count: suggestions.newReleases?.length || 0 },
    { id: 'topRated', label: 'Top Rated', icon: Star, count: suggestions.topRated?.length || 0 },
    { id: 'similar', label: 'Similar', icon: Eye, count: suggestions.similar?.length || 0 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">Personalized for You</h2>
        </div>
        <button
          onClick={loadPersonalizedSuggestions}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className="px-2 py-1 bg-white/20 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {getTabContent()}
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg border border-purple-500/30 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-6 h-6 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">AI Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
          <div>
            <p className="font-medium text-white mb-2">Your Taste Profile:</p>
            <p>• Prefers {userPreferences.genres.slice(0, 3).join(', ') || 'Action, Drama'} movies</p>
            <p>• Average rating: {userPreferences.ratingRange[0]}+ stars</p>
            <p>• Recent activity: {suggestions.recommended?.length || 0} recommendations</p>
          </div>
          <div>
            <p className="font-medium text-white mb-2">Recommendation Engine:</p>
            <p>• Based on your viewing history</p>
            <p>• Similar user preferences</p>
            <p>• Real-time trending data</p>
          </div>
        </div>
      </div>

      {/* Preferences Panel */}
      <div className="bg-gray-800/50 rounded-lg border border-white/10 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Customize Your Experience</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">Favorite Genres</label>
            <div className="flex flex-wrap gap-2">
              {['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance'].map(genre => (
                <button
                  key={genre}
                  onClick={() => {
                    const newGenres = userPreferences.genres.includes(genre)
                      ? userPreferences.genres.filter(g => g !== genre)
                      : [...userPreferences.genres, genre];
                    updatePreferences({ genres: newGenres });
                  }}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    userPreferences.genres.includes(genre)
                      ? 'bg-primary text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-gray-300 mb-2">Rating Range</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={userPreferences.ratingRange[0]}
                onChange={(e) => updatePreferences({ 
                  ratingRange: [parseFloat(e.target.value), userPreferences.ratingRange[1]] 
                })}
                className="flex-1"
              />
              <span className="text-white text-sm">
                {userPreferences.ratingRange[0]}+
              </span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-gray-300 mb-2">Year Range</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={userPreferences.yearRange[0]}
                onChange={(e) => updatePreferences({ 
                  yearRange: [parseInt(e.target.value), userPreferences.yearRange[1]] 
                })}
                className="w-20 p-2 bg-gray-700 border border-white/10 rounded-lg text-white text-sm"
                placeholder="From"
              />
              <span className="text-gray-400">to</span>
              <input
                type="number"
                value={userPreferences.yearRange[1]}
                onChange={(e) => updatePreferences({ 
                  yearRange: [userPreferences.yearRange[0], parseInt(e.target.value)] 
                })}
                className="w-20 p-2 bg-gray-700 border border-white/10 rounded-lg text-white text-sm"
                placeholder="To"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalizedSuggestions;
