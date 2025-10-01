import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Star, 
  Calendar, 
  Award, 
  Target, 
  Zap,
  Film,
  Users,
  DollarSign,
  Eye,
  Heart
} from 'lucide-react';

const PersonalAnalytics = ({ userId }) => {
  const [analytics, setAnalytics] = useState(null);
  const [timeRange, setTimeRange] = useState('6months');
  const [loading, setLoading] = useState(true);

  // Mock analytics data - replace with actual API call
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData = {
        overview: {
          totalMovies: 47,
          totalSpent: 342.50,
          averageRating: 7.8,
          favoriteGenre: 'Sci-Fi',
          watchTime: 94.5, // hours
          streak: 12, // days
          badges: 8
        },
        monthlyStats: [
          { month: 'Jan', movies: 8, spent: 65.50, rating: 7.5 },
          { month: 'Feb', movies: 6, spent: 48.00, rating: 8.2 },
          { month: 'Mar', movies: 12, spent: 89.50, rating: 7.9 },
          { month: 'Apr', movies: 9, spent: 72.00, rating: 8.1 },
          { month: 'May', movies: 7, spent: 56.50, rating: 7.7 },
          { month: 'Jun', movies: 5, spent: 41.00, rating: 8.4 }
        ],
        genreBreakdown: [
          { genre: 'Sci-Fi', count: 15, percentage: 32, color: '#3B82F6' },
          { genre: 'Action', count: 12, percentage: 26, color: '#EF4444' },
          { genre: 'Drama', count: 8, percentage: 17, color: '#10B981' },
          { genre: 'Comedy', count: 7, percentage: 15, color: '#F59E0B' },
          { genre: 'Horror', count: 5, percentage: 10, color: '#8B5CF6' }
        ],
        topMovies: [
          { title: 'Inception', rating: 9.5, year: 2010, genre: 'Sci-Fi' },
          { title: 'The Dark Knight', rating: 9.2, year: 2008, genre: 'Action' },
          { title: 'Interstellar', rating: 9.0, year: 2014, genre: 'Sci-Fi' },
          { title: 'Pulp Fiction', rating: 8.8, year: 1994, genre: 'Drama' },
          { title: 'The Matrix', rating: 8.7, year: 1999, genre: 'Sci-Fi' }
        ],
        spendingPatterns: {
          averagePerMovie: 7.28,
          peakSpendingMonth: 'March',
          budgetUtilization: 85,
          savings: 51.50
        },
        achievements: [
          { title: 'Movie Buff', description: 'Watched 50+ movies', icon: Film, earned: true },
          { title: 'Genre Explorer', description: 'Watched 10+ different genres', icon: Target, earned: true },
          { title: 'Night Owl', description: 'Watched 20+ late night shows', icon: Clock, earned: true },
          { title: 'Critic', description: 'Rated 100+ movies', icon: Star, earned: false },
          { title: 'Social Butterfly', description: 'Watched with friends 10+ times', icon: Users, earned: false }
        ],
        recommendations: [
          { type: 'genre', message: 'Try more Drama movies - you rate them highly!', priority: 'high' },
          { type: 'timing', message: 'You save 15% on weekday matinees', priority: 'medium' },
          { type: 'social', message: 'Invite friends to your next movie night', priority: 'low' }
        ]
      };
      
      setAnalytics(mockData);
      setLoading(false);
    };

    fetchAnalytics();
  }, [userId, timeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) return null;

  const StatCard = ({ title, value, icon: Icon, change, color = 'blue' }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '+' : ''}{change}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const ProgressBar = ({ label, value, max, color = 'blue' }) => (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium">{value}/{max}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`bg-${color}-600 h-2 rounded-full transition-all duration-300`}
          style={{ width: `${(value / max) * 100}%` }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Movie Analytics</h2>
          <p className="text-gray-600">Insights into your movie watching habits</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="3months">Last 3 months</option>
          <option value="6months">Last 6 months</option>
          <option value="1year">Last year</option>
          <option value="all">All time</option>
        </select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Movies Watched"
          value={analytics.overview.totalMovies}
          icon={Film}
          change={12}
          color="blue"
        />
        <StatCard
          title="Total Spent"
          value={`$${analytics.overview.totalSpent}`}
          icon={DollarSign}
          change={-5}
          color="green"
        />
        <StatCard
          title="Average Rating"
          value={analytics.overview.averageRating}
          icon={Star}
          change={3}
          color="yellow"
        />
        <StatCard
          title="Watch Time"
          value={`${analytics.overview.watchTime}h`}
          icon={Clock}
          change={8}
          color="purple"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Monthly Trends
          </h3>
          <div className="space-y-4">
            {analytics.monthlyStats.map((month, index) => (
              <div key={month.month} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{month.month}</span>
                  <span className="text-gray-600">{month.movies} movies</span>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(month.movies / 12) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">${month.spent}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Genre Breakdown */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-green-600" />
            Genre Preferences
          </h3>
          <div className="space-y-3">
            {analytics.genreBreakdown.map((genre) => (
              <div key={genre.genre} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{genre.genre}</span>
                  <span className="text-gray-600">{genre.count} movies</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{ 
                      width: `${genre.percentage}%`,
                      backgroundColor: genre.color
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Movies & Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Rated Movies */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-600" />
            Your Top Movies
          </h3>
          <div className="space-y-3">
            {analytics.topMovies.map((movie, index) => (
              <div key={movie.title} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{movie.title}</p>
                    <p className="text-sm text-gray-600">{movie.year} • {movie.genre}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="font-medium">{movie.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            Achievements
          </h3>
          <div className="space-y-3">
            {analytics.achievements.map((achievement, index) => (
              <div key={index} className={`flex items-center gap-3 p-3 rounded-lg ${
                achievement.earned ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
              }`}>
                <div className={`p-2 rounded-lg ${
                  achievement.earned ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <achievement.icon className={`w-5 h-5 ${
                    achievement.earned ? 'text-green-600' : 'text-gray-400'
                  }`} />
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${
                    achievement.earned ? 'text-green-900' : 'text-gray-600'
                  }`}>
                    {achievement.title}
                  </p>
                  <p className={`text-sm ${
                    achievement.earned ? 'text-green-700' : 'text-gray-500'
                  }`}>
                    {achievement.description}
                  </p>
                </div>
                {achievement.earned && (
                  <div className="text-green-600">
                    <Zap className="w-5 h-5" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Spending Analysis & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Analysis */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Spending Analysis
          </h3>
          <div className="space-y-4">
            <ProgressBar
              label="Budget Utilization"
              value={analytics.spendingPatterns.budgetUtilization}
              max={100}
              color="green"
            />
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  ${analytics.spendingPatterns.averagePerMovie}
                </p>
                <p className="text-sm text-blue-800">Avg per movie</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  ${analytics.spendingPatterns.savings}
                </p>
                <p className="text-sm text-green-800">Saved this month</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-600" />
            Personalized Recommendations
          </h3>
          <div className="space-y-3">
            {analytics.recommendations.map((rec, index) => (
              <div key={index} className={`p-3 rounded-lg border-l-4 ${
                rec.priority === 'high' ? 'bg-red-50 border-red-400' :
                rec.priority === 'medium' ? 'bg-yellow-50 border-yellow-400' :
                'bg-blue-50 border-blue-400'
              }`}>
                <p className="font-medium text-gray-900">{rec.message}</p>
                <p className="text-sm text-gray-600 capitalize">
                  {rec.priority} priority
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Streak & Social Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-600" />
          Your Movie Journey
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {analytics.overview.streak}
            </div>
            <p className="text-gray-600">Day streak</p>
            <p className="text-sm text-gray-500">Keep it up!</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {analytics.overview.badges}
            </div>
            <p className="text-gray-600">Badges earned</p>
            <p className="text-sm text-gray-500">Movie enthusiast</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {analytics.overview.favoriteGenre}
            </div>
            <p className="text-gray-600">Favorite genre</p>
            <p className="text-sm text-gray-500">Your go-to choice</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalAnalytics;
