import React, { useState } from 'react';
import { 
  Camera, 
  Search, 
  BarChart3, 
  GitCompare, 
  Filter,
  Zap,
  Star,
  Eye,
  Heart
} from 'lucide-react';

// Import all the new components
import ARSeatPreview from './seatSelection/ARSeatPreview';
import SmartSeatSelector from './seatSelection/SmartSeatSelector';
import AdvancedSearch from './search/AdvancedSearch';
import PersonalAnalytics from './analytics/PersonalAnalytics';
import MovieComparison from './comparison/MovieComparison';
import EnhancedSearchFilters from './search/EnhancedSearchFilters';

const EnhancedFeatures = () => {
  const [activeFeature, setActiveFeature] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMovies, setSelectedMovies] = useState([]);
  const [searchFilters, setSearchFilters] = useState({});

  const features = [
    {
      id: 'ar-seat',
      title: 'AR Seat Preview',
      description: 'Use your camera to preview seats in real-time',
      icon: Camera,
      color: 'blue',
      component: ARSeatPreview
    },
    {
      id: 'smart-seat',
      title: 'Smart Seat Selection',
      description: 'AI-powered seat recommendations with optimal viewing',
      icon: Star,
      color: 'green',
      component: SmartSeatSelector
    },
    {
      id: 'advanced-search',
      title: 'Advanced Search',
      description: 'Voice, image, and intelligent search capabilities',
      icon: Search,
      color: 'purple',
      component: AdvancedSearch
    },
    {
      id: 'analytics',
      title: 'Personal Analytics',
      description: 'Comprehensive insights into your movie habits',
      icon: BarChart3,
      color: 'yellow',
      component: PersonalAnalytics
    },
    {
      id: 'comparison',
      title: 'Movie Comparison',
      description: 'Compare up to 4 movies side-by-side',
      icon: GitCompare,
      color: 'red',
      component: MovieComparison
    },
    {
      id: 'filters',
      title: 'Enhanced Filters',
      description: 'Advanced filtering with 50+ criteria',
      icon: Filter,
      color: 'indigo',
      component: EnhancedSearchFilters
    }
  ];

  const handleSearch = (query) => {
    console.log('Searching for:', query);
    // Implement actual search logic
    setSearchResults([]);
  };

  const handleSearchResults = (results) => {
    setSearchResults(results);
  };

  const handleSeatSelect = (seat) => {
    console.log('Seat selected:', seat);
    // Implement seat selection logic
  };

  const handleFiltersChange = (filters) => {
    setSearchFilters(filters);
    console.log('Filters updated:', filters);
  };

  const renderFeature = (feature) => {
    const Component = feature.component;
    
    switch (feature.id) {
      case 'ar-seat':
        return (
          <ARSeatPreview
            isOpen={activeFeature === feature.id}
            onClose={() => setActiveFeature(null)}
            seatData={{
              id: 'A12',
              number: 12,
              row: 'A',
              x: 12,
              y: 0,
              price: 15,
              available: true
            }}
            theaterLayout={{ width: 20, height: 10 }}
          />
        );
      
      case 'smart-seat':
        return (
          <SmartSeatSelector
            showId="mock-show-id"
            onSeatSelect={handleSeatSelect}
            selectedSeats={[]}
          />
        );
      
      case 'advanced-search':
        return (
          <AdvancedSearch
            onSearch={handleSearch}
            onResults={handleSearchResults}
          />
        );
      
      case 'analytics':
        return (
          <PersonalAnalytics
            userId="current-user-id"
          />
        );
      
      case 'comparison':
        return (
          <MovieComparison
            onClose={() => setActiveFeature(null)}
          />
        );
      
      case 'filters':
        return (
          <EnhancedSearchFilters
            onFiltersChange={handleFiltersChange}
            initialFilters={searchFilters}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Enhanced Features</h1>
              <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                Beta
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                {searchResults.length} results
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setActiveFeature(feature.id)}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 rounded-lg bg-${feature.color}-100`}>
                    <Icon className={`w-6 h-6 text-${feature.color}-600`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Click to {activeFeature === feature.id ? 'close' : 'open'}
                  </span>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span className="text-xs text-gray-500">AI Powered</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Feature Display */}
        {activeFeature && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {features.find(f => f.id === activeFeature)?.title}
              </h2>
              <button
                onClick={() => setActiveFeature(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {renderFeature(features.find(f => f.id === activeFeature))}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Features Used</p>
                <p className="text-lg font-semibold text-gray-900">12</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Time Saved</p>
                <p className="text-lg font-semibold text-gray-900">2.5h</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <Star className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Accuracy</p>
                <p className="text-lg font-semibold text-gray-900">94%</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">AI Suggestions</p>
                <p className="text-lg font-semibold text-gray-900">47</p>
              </div>
            </div>
          </div>
        </div>

        {/* Integration Tips */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            💡 Pro Tips for Using Enhanced Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <p className="font-medium mb-2">🎯 Smart Seat Selection:</p>
              <p>Use AR preview to find the perfect viewing angle before booking</p>
            </div>
            <div>
              <p className="font-medium mb-2">🔍 Advanced Search:</p>
              <p>Try voice search for hands-free movie discovery</p>
            </div>
            <div>
              <p className="font-medium mb-2">📊 Personal Analytics:</p>
              <p>Check your movie habits to discover new preferences</p>
            </div>
            <div>
              <p className="font-medium mb-2">⚖️ Movie Comparison:</p>
              <p>Compare up to 4 movies to make the best choice</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedFeatures;
