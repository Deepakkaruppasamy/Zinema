import React, { useState, useRef, useEffect } from 'react';
import { Search, Mic, Camera, Filter, X, Star, Calendar, Clock, Users } from 'lucide-react';

const AdvancedSearch = ({ onSearch, onResults }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isImageSearch, setIsImageSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    genre: [],
    year: { min: 1990, max: 2024 },
    rating: { min: 0, max: 10 },
    duration: { min: 60, max: 300 },
    language: [],
    director: '',
    cast: '',
    sortBy: 'relevance'
  });
  const [searchHistory, setSearchHistory] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsListening(false);
        handleSearch(transcript);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Mock suggestions data
  const mockSuggestions = [
    'Action movies 2024',
    'Christopher Nolan films',
    'Marvel superhero movies',
    'Romantic comedies',
    'Sci-fi thrillers',
    'Award winning movies',
    'Movies with Tom Hanks',
    'Disney animated films'
  ];

  const handleSearch = async (query = searchQuery) => {
    if (!query.trim()) return;

    // Add to search history
    setSearchHistory(prev => {
      const newHistory = [query, ...prev.filter(item => item !== query)].slice(0, 10);
      return newHistory;
    });

    // Simulate search with filters
    const searchResults = await performSearch(query, filters);
    onResults?.(searchResults);
    onSearch?.(query);
  };

  const performSearch = async (query, searchFilters) => {
    // Mock search results - replace with actual API call
    const mockResults = [
      {
        id: 1,
        title: 'Inception',
        year: 2010,
        genre: ['Sci-Fi', 'Thriller'],
        rating: 8.8,
        duration: 148,
        director: 'Christopher Nolan',
        cast: ['Leonardo DiCaprio', 'Marion Cotillard'],
        poster: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
        matchScore: 95
      },
      {
        id: 2,
        title: 'Interstellar',
        year: 2014,
        genre: ['Sci-Fi', 'Drama'],
        rating: 8.6,
        duration: 169,
        director: 'Christopher Nolan',
        cast: ['Matthew McConaughey', 'Anne Hathaway'],
        poster: 'https://image.tmdb.org/t/p/w500/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg',
        matchScore: 92
      }
    ];

    // Filter results based on search filters
    return mockResults.filter(movie => {
      if (searchFilters.genre.length > 0 && !searchFilters.genre.some(g => movie.genre.includes(g))) {
        return false;
      }
      if (movie.year < searchFilters.year.min || movie.year > searchFilters.year.max) {
        return false;
      }
      if (movie.rating < searchFilters.rating.min || movie.rating > searchFilters.rating.max) {
        return false;
      }
      if (movie.duration < searchFilters.duration.min || movie.duration > searchFilters.duration.max) {
        return false;
      }
      if (searchFilters.director && !movie.director.toLowerCase().includes(searchFilters.director.toLowerCase())) {
        return false;
      }
      if (searchFilters.cast && !movie.cast.some(actor => actor.toLowerCase().includes(searchFilters.cast.toLowerCase()))) {
        return false;
      }
      return true;
    });
  };

  const startVoiceSearch = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const handleImageSearch = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        setIsImageSearch(true);
        // Here you would send the image to your image recognition API
        performImageSearch(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const performImageSearch = async (imageFile) => {
    // Mock image search - replace with actual API call
    const mockImageResults = [
      {
        id: 3,
        title: 'The Dark Knight',
        year: 2008,
        genre: ['Action', 'Crime'],
        rating: 9.0,
        matchScore: 88,
        poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg'
      }
    ];
    
    onResults?.(mockImageResults);
  };

  const handleInputChange = (value) => {
    setSearchQuery(value);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for suggestions
    searchTimeoutRef.current = setTimeout(() => {
      if (value.length > 2) {
        const filteredSuggestions = mockSuggestions.filter(suggestion =>
          suggestion.toLowerCase().includes(value.toLowerCase())
        );
        setSuggestions(filteredSuggestions);
      } else {
        setSuggestions([]);
      }
    }, 300);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setSuggestions([]);
    handleSearch(suggestion);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setImagePreview(null);
    setIsImageSearch(false);
    setSuggestions([]);
    onResults?.([]);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Search Bar */}
      <div className="relative">
        <div className="flex items-center bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Search Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={isImageSearch ? "Search by image..." : "Search movies, actors, directors..."}
              className="w-full px-6 py-4 text-lg border-0 focus:ring-0 focus:outline-none"
            />
            
            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-xl shadow-lg z-10">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-6 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <Search className="w-4 h-4 inline mr-2 text-gray-400" />
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center border-l border-gray-200">
            {/* Voice Search */}
            <button
              onClick={startVoiceSearch}
              disabled={isListening}
              className={`p-4 hover:bg-gray-50 transition-colors ${
                isListening ? 'text-red-500' : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Voice Search"
            >
              <Mic className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
            </button>

            {/* Image Search */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-4 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
              title="Search by Image"
            >
              <Camera className="w-5 h-5" />
            </button>

            {/* Filters */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-4 hover:bg-gray-50 transition-colors ${
                showFilters ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Advanced Filters"
            >
              <Filter className="w-5 h-5" />
            </button>

            {/* Search Button */}
            <button
              onClick={() => handleSearch()}
              className="px-6 py-4 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Clear Button */}
            {(searchQuery || imagePreview) && (
              <button
                onClick={clearSearch}
                className="p-4 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                title="Clear Search"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Image Preview */}
        {imagePreview && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-4">
              <img
                src={imagePreview}
                alt="Search preview"
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div>
                <p className="font-medium text-gray-800">Searching by image...</p>
                <p className="text-sm text-gray-600">Finding similar movies</p>
              </div>
            </div>
          </div>
        )}

        {/* Voice Search Indicator */}
        {isListening && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-600">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Listening... Speak now</span>
            </div>
          </div>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="mt-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Advanced Filters</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Genre Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Genres</label>
              <div className="space-y-2">
                {['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance', 'Thriller'].map(genre => (
                  <label key={genre} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.genre.includes(genre)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters(prev => ({ ...prev, genre: [...prev.genre, genre] }));
                        } else {
                          setFilters(prev => ({ ...prev, genre: prev.genre.filter(g => g !== genre) }));
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">{genre}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Year Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year: {filters.year.min} - {filters.year.max}
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="1990"
                  max="2024"
                  value={filters.year.min}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    year: { ...prev.year, min: parseInt(e.target.value) }
                  }))}
                  className="w-full"
                />
                <input
                  type="range"
                  min="1990"
                  max="2024"
                  value={filters.year.max}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    year: { ...prev.year, max: parseInt(e.target.value) }
                  }))}
                  className="w-full"
                />
              </div>
            </div>

            {/* Rating Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating: {filters.rating.min} - {filters.rating.max}
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={filters.rating.min}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    rating: { ...prev.rating, min: parseFloat(e.target.value) }
                  }))}
                  className="w-full"
                />
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={filters.rating.max}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    rating: { ...prev.rating, max: parseFloat(e.target.value) }
                  }))}
                  className="w-full"
                />
              </div>
            </div>

            {/* Director */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Director</label>
              <input
                type="text"
                value={filters.director}
                onChange={(e) => setFilters(prev => ({ ...prev, director: e.target.value }))}
                placeholder="e.g., Christopher Nolan"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Cast */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cast</label>
              <input
                type="text"
                value={filters.cast}
                onChange={(e) => setFilters(prev => ({ ...prev, cast: e.target.value }))}
                placeholder="e.g., Leonardo DiCaprio"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="relevance">Relevance</option>
                <option value="rating">Rating</option>
                <option value="year">Year</option>
                <option value="title">Title</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setFilters({
                genre: [],
                year: { min: 1990, max: 2024 },
                rating: { min: 0, max: 10 },
                duration: { min: 60, max: 300 },
                language: [],
                director: '',
                cast: '',
                sortBy: 'relevance'
              })}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Clear Filters
            </button>
            <button
              onClick={() => handleSearch()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Search History */}
      {searchHistory.length > 0 && !searchQuery && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Searches</h4>
          <div className="flex flex-wrap gap-2">
            {searchHistory.slice(0, 5).map((item, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(item)}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hidden file input for image search */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSearch}
        className="hidden"
      />
    </div>
  );
};

export default AdvancedSearch;
