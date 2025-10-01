import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  X, 
  Search, 
  Calendar, 
  Star, 
  Clock, 
  Globe, 
  Users, 
  Award,
  Zap,
  RefreshCw
} from 'lucide-react';

const EnhancedSearchFilters = ({ onFiltersChange, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    // Basic filters
    genre: [],
    year: { min: 1990, max: 2024 },
    rating: { min: 0, max: 10 },
    duration: { min: 60, max: 300 },
    language: [],
    
    // Advanced filters
    director: '',
    cast: '',
    studio: '',
    country: [],
    awards: [],
    budget: { min: 0, max: 500000000 },
    boxOffice: { min: 0, max: 3000000000 },
    
    // Content filters
    contentRating: [],
    themes: [],
    mood: [],
    
    // Technical filters
    aspectRatio: [],
    colorType: [],
    soundMix: [],
    
    // Availability filters
    streamingPlatform: [],
    theaterAvailability: false,
    releaseStatus: [],
    
    // Personalization
    watchlist: false,
    watched: false,
    recommended: false,
    
    // Sorting
    sortBy: 'relevance',
    sortOrder: 'desc',
    
    ...initialFilters
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [presetFilters, setPresetFilters] = useState([]);

  // Filter options
  const filterOptions = {
    genre: [
      'Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime', 'Documentary',
      'Drama', 'Family', 'Fantasy', 'Film-Noir', 'History', 'Horror', 'Music', 'Musical',
      'Mystery', 'Romance', 'Sci-Fi', 'Sport', 'Thriller', 'War', 'Western'
    ],
    language: [
      'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Russian',
      'Chinese', 'Japanese', 'Korean', 'Hindi', 'Arabic', 'Dutch', 'Swedish', 'Norwegian'
    ],
    country: [
      'United States', 'United Kingdom', 'Canada', 'Australia', 'France', 'Germany',
      'Italy', 'Spain', 'Japan', 'South Korea', 'India', 'Brazil', 'Mexico', 'Russia'
    ],
    awards: [
      'Oscar Winner', 'Oscar Nominee', 'Golden Globe Winner', 'BAFTA Winner',
      'Cannes Winner', 'Sundance Winner', 'Emmy Winner', 'Grammy Winner'
    ],
    contentRating: [
      'G', 'PG', 'PG-13', 'R', 'NC-17', 'TV-G', 'TV-PG', 'TV-14', 'TV-MA'
    ],
    themes: [
      'Love', 'Friendship', 'Family', 'Adventure', 'Mystery', 'Horror', 'Comedy',
      'Drama', 'Action', 'Romance', 'Thriller', 'Sci-Fi', 'Fantasy', 'History'
    ],
    mood: [
      'Happy', 'Sad', 'Exciting', 'Relaxing', 'Thought-provoking', 'Inspiring',
      'Funny', 'Romantic', 'Suspenseful', 'Nostalgic', 'Dark', 'Uplifting'
    ],
    aspectRatio: ['1.33:1', '1.37:1', '1.66:1', '1.78:1', '1.85:1', '2.35:1', '2.39:1'],
    colorType: ['Color', 'Black and White', 'Mixed'],
    soundMix: ['Mono', 'Stereo', 'Dolby Digital', 'DTS', 'Dolby Atmos'],
    releaseStatus: ['Released', 'In Production', 'Post Production', 'Announced'],
    streamingPlatform: ['Netflix', 'Amazon Prime', 'Disney+', 'HBO Max', 'Hulu', 'Apple TV+']
  };

  // Preset filter configurations
  const presets = [
    {
      name: 'Oscar Winners',
      filters: { awards: ['Oscar Winner'], rating: { min: 7.0, max: 10 } }
    },
    {
      name: 'Recent Blockbusters',
      filters: { year: { min: 2020, max: 2024 }, boxOffice: { min: 100000000, max: 3000000000 } }
    },
    {
      name: 'Hidden Gems',
      filters: { rating: { min: 7.5, max: 10 }, boxOffice: { min: 0, max: 50000000 } }
    },
    {
      name: 'Family Friendly',
      filters: { contentRating: ['G', 'PG', 'PG-13'], genre: ['Family', 'Animation', 'Comedy'] }
    },
    {
      name: 'Cult Classics',
      filters: { year: { min: 1970, max: 2000 }, rating: { min: 7.0, max: 10 } }
    }
  ];

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleFilterChange = (category, value) => {
    setFilters(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleArrayFilterChange = (category, value, checked) => {
    setFilters(prev => ({
      ...prev,
      [category]: checked 
        ? [...prev[category], value]
        : prev[category].filter(item => item !== value)
    }));
  };

  const handleRangeFilterChange = (category, field, value) => {
    setFilters(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: parseInt(value)
      }
    }));
  };

  const applyPreset = (preset) => {
    setFilters(prev => ({
      ...prev,
      ...preset.filters
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      genre: [],
      year: { min: 1990, max: 2024 },
      rating: { min: 0, max: 10 },
      duration: { min: 60, max: 300 },
      language: [],
      director: '',
      cast: '',
      studio: '',
      country: [],
      awards: [],
      budget: { min: 0, max: 500000000 },
      boxOffice: { min: 0, max: 3000000000 },
      contentRating: [],
      themes: [],
      mood: [],
      aspectRatio: [],
      colorType: [],
      soundMix: [],
      streamingPlatform: [],
      theaterAvailability: false,
      releaseStatus: [],
      watchlist: false,
      watched: false,
      recommended: false,
      sortBy: 'relevance',
      sortOrder: 'desc'
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    
    // Count array filters
    ['genre', 'language', 'country', 'awards', 'contentRating', 'themes', 'mood', 'aspectRatio', 'colorType', 'soundMix', 'streamingPlatform', 'releaseStatus'].forEach(key => {
      if (filters[key].length > 0) count++;
    });
    
    // Count text filters
    ['director', 'cast', 'studio'].forEach(key => {
      if (filters[key].trim()) count++;
    });
    
    // Count boolean filters
    ['theaterAvailability', 'watchlist', 'watched', 'recommended'].forEach(key => {
      if (filters[key]) count++;
    });
    
    // Count range filters
    ['year', 'rating', 'duration', 'budget', 'boxOffice'].forEach(key => {
      const range = filters[key];
      if (range.min !== (key === 'year' ? 1990 : key === 'rating' ? 0 : key === 'duration' ? 60 : 0) || 
          range.max !== (key === 'year' ? 2024 : key === 'rating' ? 10 : key === 'duration' ? 300 : key === 'budget' ? 500000000 : 3000000000)) {
        count++;
      }
    });
    
    return count;
  };

  const FilterSection = ({ title, children, icon: Icon }) => (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4" />}
        {title}
      </h4>
      {children}
    </div>
  );

  const RangeSlider = ({ label, value, min, max, step = 1, onChange, format }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}: {format ? format(value.min) : value.min} - {format ? format(value.max) : value.max}
      </label>
      <div className="space-y-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value.min}
          onChange={(e) => onChange('min', parseInt(e.target.value))}
          className="w-full"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value.max}
          onChange={(e) => onChange('max', parseInt(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  );

  const CheckboxGroup = ({ options, selected, onChange, columns = 2 }) => (
    <div className={`grid grid-cols-${columns} gap-2`}>
      {options.map(option => (
        <label key={option} className="flex items-center">
          <input
            type="checkbox"
            checked={selected.includes(option)}
            onChange={(e) => onChange(option, e.target.checked)}
            className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">{option}</span>
        </label>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Search Filters</h3>
          {getActiveFilterCount() > 0 && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {getActiveFilterCount()} active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showAdvanced ? 'Basic' : 'Advanced'}
          </button>
          <button
            onClick={clearAllFilters}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Preset Filters */}
      <div className="flex flex-wrap gap-2">
        {presets.map((preset, index) => (
          <button
            key={index}
            onClick={() => applyPreset(preset)}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Basic Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <FilterSection title="Genres" icon={Film}>
          <CheckboxGroup
            options={filterOptions.genre}
            selected={filters.genre}
            onChange={(value, checked) => handleArrayFilterChange('genre', value, checked)}
            columns={2}
          />
        </FilterSection>

        <FilterSection title="Year Range" icon={Calendar}>
          <RangeSlider
            label="Release Year"
            value={filters.year}
            min={1900}
            max={2024}
            onChange={(field, value) => handleRangeFilterChange('year', field, value)}
          />
        </FilterSection>

        <FilterSection title="Rating" icon={Star}>
          <RangeSlider
            label="IMDb Rating"
            value={filters.rating}
            min={0}
            max={10}
            step={0.1}
            onChange={(field, value) => handleRangeFilterChange('rating', field, value)}
          />
        </FilterSection>

        <FilterSection title="Duration" icon={Clock}>
          <RangeSlider
            label="Runtime (minutes)"
            value={filters.duration}
            min={30}
            max={300}
            onChange={(field, value) => handleRangeFilterChange('duration', field, value)}
          />
        </FilterSection>

        <FilterSection title="Language" icon={Globe}>
          <CheckboxGroup
            options={filterOptions.language}
            selected={filters.language}
            onChange={(value, checked) => handleArrayFilterChange('language', value, checked)}
            columns={2}
          />
        </FilterSection>

        <FilterSection title="Content Rating" icon={Award}>
          <CheckboxGroup
            options={filterOptions.contentRating}
            selected={filters.contentRating}
            onChange={(value, checked) => handleArrayFilterChange('contentRating', value, checked)}
            columns={2}
          />
        </FilterSection>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            Advanced Filters
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FilterSection title="People">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Director</label>
                  <input
                    type="text"
                    value={filters.director}
                    onChange={(e) => handleFilterChange('director', e.target.value)}
                    placeholder="e.g., Christopher Nolan"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cast</label>
                  <input
                    type="text"
                    value={filters.cast}
                    onChange={(e) => handleFilterChange('cast', e.target.value)}
                    placeholder="e.g., Leonardo DiCaprio"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Studio</label>
                  <input
                    type="text"
                    value={filters.studio}
                    onChange={(e) => handleFilterChange('studio', e.target.value)}
                    placeholder="e.g., Warner Bros"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </FilterSection>

            <FilterSection title="Financial">
              <div className="space-y-4">
                <RangeSlider
                  label="Budget"
                  value={filters.budget}
                  min={0}
                  max={500000000}
                  step={1000000}
                  onChange={(field, value) => handleRangeFilterChange('budget', field, value)}
                  format={(value) => `$${(value / 1000000).toFixed(0)}M`}
                />
                <RangeSlider
                  label="Box Office"
                  value={filters.boxOffice}
                  min={0}
                  max={3000000000}
                  step={10000000}
                  onChange={(field, value) => handleRangeFilterChange('boxOffice', field, value)}
                  format={(value) => `$${(value / 1000000).toFixed(0)}M`}
                />
              </div>
            </FilterSection>

            <FilterSection title="Awards & Recognition" icon={Award}>
              <CheckboxGroup
                options={filterOptions.awards}
                selected={filters.awards}
                onChange={(value, checked) => handleArrayFilterChange('awards', value, checked)}
                columns={1}
              />
            </FilterSection>

            <FilterSection title="Country" icon={Globe}>
              <CheckboxGroup
                options={filterOptions.country}
                selected={filters.country}
                onChange={(value, checked) => handleArrayFilterChange('country', value, checked)}
                columns={2}
              />
            </FilterSection>

            <FilterSection title="Themes & Mood">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Themes</label>
                  <CheckboxGroup
                    options={filterOptions.themes}
                    selected={filters.themes}
                    onChange={(value, checked) => handleArrayFilterChange('themes', value, checked)}
                    columns={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mood</label>
                  <CheckboxGroup
                    options={filterOptions.mood}
                    selected={filters.mood}
                    onChange={(value, checked) => handleArrayFilterChange('mood', value, checked)}
                    columns={2}
                  />
                </div>
              </div>
            </FilterSection>

            <FilterSection title="Technical">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Aspect Ratio</label>
                  <CheckboxGroup
                    options={filterOptions.aspectRatio}
                    selected={filters.aspectRatio}
                    onChange={(value, checked) => handleArrayFilterChange('aspectRatio', value, checked)}
                    columns={1}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color Type</label>
                  <CheckboxGroup
                    options={filterOptions.colorType}
                    selected={filters.colorType}
                    onChange={(value, checked) => handleArrayFilterChange('colorType', value, checked)}
                    columns={1}
                  />
                </div>
              </div>
            </FilterSection>
          </div>

          {/* Personalization Filters */}
          <FilterSection title="Personalization">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.watchlist}
                  onChange={(e) => handleFilterChange('watchlist', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">In Watchlist</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.watched}
                  onChange={(e) => handleFilterChange('watched', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Already Watched</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.recommended}
                  onChange={(e) => handleFilterChange('recommended', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Recommended</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.theaterAvailability}
                  onChange={(e) => handleFilterChange('theaterAvailability', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">In Theaters</span>
              </label>
            </div>
          </FilterSection>

          {/* Sorting */}
          <FilterSection title="Sorting">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="relevance">Relevance</option>
                  <option value="rating">Rating</option>
                  <option value="year">Year</option>
                  <option value="title">Title</option>
                  <option value="duration">Duration</option>
                  <option value="boxOffice">Box Office</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>
          </FilterSection>
        </div>
      )}
    </div>
  );
};

export default EnhancedSearchFilters;
