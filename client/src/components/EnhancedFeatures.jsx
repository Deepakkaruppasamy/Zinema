import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MovieComparison from './comparison/MovieComparison';

const EnhancedFeatures = () => {
  const navigate = useNavigate();
  const [showComparison, setShowComparison] = useState(true);

  const handleClose = () => {
    setShowComparison(false);
    navigate('/');
  };

  if (!showComparison) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={handleClose}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Movie Comparison</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MovieComparison onClose={handleClose} />
      </div>
    </div>
  );
};

export default EnhancedFeatures;
