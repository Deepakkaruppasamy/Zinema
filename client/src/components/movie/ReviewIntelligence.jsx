import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, ThumbsUp, ThumbsDown, Flag, Sparkles, BarChart3, Heart, Zap, Shield } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

/**
 * AI-Powered Review Intelligence Component
 * Shows sentiment analysis, personalized summaries, and quality indicators
 */
const ReviewIntelligence = ({ movieId }) => {
  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary');
  const { api, user } = useAppContext();

  useEffect(() => {
    if (movieId) {
      fetchReviewSummary();
      if (user) fetchAnalytics(); // Only fetch analytics if user is logged in
    }
  }, [movieId, user]);

  const fetchReviewSummary = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/api/review/${movieId}/summary`);
      if (data.success) {
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Failed to fetch review summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const { data } = await api.get(`/api/review/analytics/${movieId}`);
      if (data.success) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  const getRecommendationColor = (recommendation) => {
    switch (recommendation) {
      case 'strongly_positive': return 'text-green-400 bg-green-400/10';
      case 'positive': return 'text-green-300 bg-green-300/10';
      case 'neutral': return 'text-yellow-400 bg-yellow-400/10';
      case 'negative': return 'text-red-300 bg-red-300/10';
      case 'strongly_negative': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getRecommendationIcon = (recommendation) => {
    switch (recommendation) {
      case 'strongly_positive': return <Heart className="w-4 h-4" />;
      case 'positive': return <ThumbsUp className="w-4 h-4" />;
      case 'neutral': return <BarChart3 className="w-4 h-4" />;
      case 'negative': return <ThumbsDown className="w-4 h-4" />;
      case 'strongly_negative': return <Flag className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const formatRecommendation = (recommendation) => {
    return recommendation?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Analyzing...';
  };

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-5 h-5 text-primary animate-pulse" />
          <h3 className="text-lg font-semibold text-white">AI Review Intelligence</h3>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-800 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-800 rounded w-3/4 animate-pulse"></div>
          <div className="h-4 bg-gray-800 rounded w-1/2 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-white">AI Review Intelligence</h3>
        </div>
        <p className="text-gray-400">No review data available for analysis.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">AI Review Intelligence</h3>
              <p className="text-sm text-gray-400">Powered by advanced sentiment analysis</p>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${getRecommendationColor(summary.recommendation)}`}>
            {getRecommendationIcon(summary.recommendation)}
            <span className="text-sm font-medium">{formatRecommendation(summary.recommendation)}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-800">
        <button
          onClick={() => setActiveTab('summary')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'summary'
              ? 'text-primary border-b-2 border-primary bg-primary/5'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            AI Summary
          </div>
        </button>
        {analytics && (
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'analytics'
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </div>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'summary' && (
          <div className="space-y-6">
            {/* AI Summary */}
            <div>
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Personalized Summary
                <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">
                  {Math.round(summary.confidenceScore * 100)}% confident
                </span>
              </h4>
              <p className="text-gray-300 leading-relaxed">{summary.summary}</p>
            </div>

            {/* Highlights */}
            {summary.highlights?.length > 0 && (
              <div>
                <h5 className="text-white font-medium mb-3 flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4 text-green-400" />
                  What People Love
                </h5>
                <ul className="space-y-2">
                  {summary.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start gap-3 text-gray-300">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Concerns */}
            {summary.concerns?.length > 0 && (
              <div>
                <h5 className="text-white font-medium mb-3 flex items-center gap-2">
                  <ThumbsDown className="w-4 h-4 text-yellow-400" />
                  Common Concerns
                </h5>
                <ul className="space-y-2">
                  {summary.concerns.map((concern, index) => (
                    <li key={index} className="flex items-start gap-3 text-gray-300">
                      <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                      {concern}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Personalized Insights */}
            {summary.personalizedInsights?.length > 0 && (
              <div>
                <h5 className="text-white font-medium mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-400" />
                  Just For You
                </h5>
                <ul className="space-y-2">
                  {summary.personalizedInsights.map((insight, index) => (
                    <li key={index} className="flex items-start gap-3 text-gray-300">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && analytics && (
          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-white">{analytics.totalReviews}</div>
                <div className="text-sm text-gray-400">Total Reviews</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-white">{analytics.averageRating?.toFixed(1) || 'N/A'}</div>
                <div className="text-sm text-gray-400">Avg Rating</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-white">
                  {analytics.averageSentiment ? (analytics.averageSentiment > 0 ? '+' : '') + analytics.averageSentiment.toFixed(2) : 'N/A'}
                </div>
                <div className="text-sm text-gray-400">Sentiment Score</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-white">{analytics.totalHelpfulVotes}</div>
                <div className="text-sm text-gray-400">Helpful Votes</div>
              </div>
            </div>

            {/* Quality Indicators */}
            <div>
              <h5 className="text-white font-medium mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                Quality Indicators
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Spam Detected</span>
                    <span className="text-red-400 font-medium">{analytics.spamCount || 0}</span>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Fake Reviews</span>
                    <span className="text-orange-400 font-medium">{analytics.fakeCount || 0}</span>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Flagged</span>
                    <span className="text-yellow-400 font-medium">{analytics.flaggedCount || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Emotions */}
            {analytics.topEmotions?.length > 0 && (
              <div>
                <h5 className="text-white font-medium mb-3">Top Emotions</h5>
                <div className="space-y-2">
                  {analytics.topEmotions.map((emotion, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <span className="text-gray-300 capitalize">{emotion.emotion}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-20 bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${emotion.intensity * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-400 w-12 text-right">
                          {Math.round(emotion.intensity * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Themes */}
            {analytics.topThemes?.length > 0 && (
              <div>
                <h5 className="text-white font-medium mb-3">Most Discussed Topics</h5>
                <div className="flex flex-wrap gap-2">
                  {analytics.topThemes.map((theme, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm capitalize"
                    >
                      {theme.theme} ({theme.count})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewIntelligence;
