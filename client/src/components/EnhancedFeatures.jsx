import React from 'react';
import MovieComparison from './comparison/MovieComparison';

const EnhancedFeatures = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900">Movie Comparison</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MovieComparison onClose={() => {}} />
      </div>
    </div>
  );
};

export default EnhancedFeatures;
