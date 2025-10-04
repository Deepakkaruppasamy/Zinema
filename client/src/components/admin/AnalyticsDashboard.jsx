import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Clock, 
  Film,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const AnalyticsDashboard = () => {
  const { axios, getToken } = useAppContext();
  const [analytics, setAnalytics] = useState(null);
  const [realtime, setRealtime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchAnalytics = async () => {
    try {
      const { data } = await axios.get(`/api/admin/analytics?period=${period}`, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      });
      
      if (data.success) {
        setAnalytics(data.analytics);
      } else {
        toast.error(data.message || 'Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to fetch analytics');
    }
  };

  const fetchRealtime = async () => {
    try {
      const { data } = await axios.get('/api/admin/realtime', {
        headers: { Authorization: `Bearer ${await getToken()}` }
      });
      
      if (data.success) {
        setRealtime(data.realtime);
      }
    } catch (error) {
      console.error('Error fetching realtime data:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchAnalytics(), fetchRealtime()]);
      setLoading(false);
    };
    
    loadData();
  }, [period]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchRealtime();
      }, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center text-gray-400 py-8">
        <div className="mb-4">
          <BarChart3 className="w-12 h-12 mx-auto text-gray-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Analytics Data Available</h3>
          <p className="text-sm text-gray-400 mb-4">
            Analytics data will appear here once you have bookings and users in your system.
          </p>
          <button
            onClick={() => {
              setLoading(true);
              fetchAnalytics();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          Analytics Dashboard
        </h2>
        
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 rounded-lg transition-colors ${
              autoRefresh 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Real-time Metrics */}
      {realtime && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 p-4 rounded-lg border border-blue-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-gray-300">New Users (24h)</span>
            </div>
            <div className="text-2xl font-bold text-blue-400">
              {realtime.last24h.newUsers}
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 p-4 rounded-lg border border-green-500/30">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              <span className="text-sm text-gray-300">Bookings (24h)</span>
            </div>
            <div className="text-2xl font-bold text-green-400">
              {realtime.last24h.bookings}
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 p-4 rounded-lg border border-purple-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-gray-300">This Hour</span>
            </div>
            <div className="text-2xl font-bold text-purple-400">
              {realtime.lastHour.bookings}
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/20 p-4 rounded-lg border border-orange-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Film className="w-5 h-5 text-orange-400" />
              <span className="text-sm text-gray-300">Active Shows</span>
            </div>
            <div className="text-2xl font-bold text-orange-400">
              {realtime.last24h.activeShows}
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800/50 p-6 rounded-lg border border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-semibold">Revenue</h3>
          </div>
          <div className="text-3xl font-bold text-green-500 mb-2">
            {formatCurrency(analytics.revenue.total)}
          </div>
          <div className="text-sm text-gray-400">
            Avg daily: {formatCurrency(analytics.revenue.avgDaily)}
          </div>
        </div>

        <div className="bg-gray-800/50 p-6 rounded-lg border border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold">New Users</h3>
          </div>
          <div className="text-3xl font-bold text-blue-500 mb-2">
            {analytics.users.total}
          </div>
          <div className="text-sm text-gray-400">
            Over {period} period
          </div>
        </div>

        <div className="bg-gray-800/50 p-6 rounded-lg border border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold">Conversion</h3>
          </div>
          <div className="text-3xl font-bold text-purple-500 mb-2">
            {analytics.conversionFunnel.conversionRate}%
          </div>
          <div className="text-sm text-gray-400">
            Payment rate: {analytics.conversionFunnel.paymentRate}%
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-gray-800/50 p-6 rounded-lg border border-white/10">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Daily Revenue Trend
        </h3>
        <div className="h-64 flex items-end gap-1">
          {analytics.revenue.daily && analytics.revenue.daily.length > 0 ? (
            analytics.revenue.daily.map((day, index) => {
              const maxRevenue = Math.max(...analytics.revenue.daily.map(d => d.dailyRevenue));
              const height = maxRevenue > 0 ? (day.dailyRevenue / maxRevenue) * 100 : 0;
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-gradient-to-t from-primary to-primary/60 rounded-t transition-all duration-300 hover:from-primary/80 hover:to-primary/40"
                    style={{ height: `${height}%` }}
                    title={`${formatDate(day._id)}: ${formatCurrency(day.dailyRevenue)}`}
                  ></div>
                  <div className="text-xs text-gray-400 mt-2 transform -rotate-45 origin-left">
                    {formatDate(day._id)}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <DollarSign className="w-8 h-8 mx-auto mb-2 text-gray-500" />
                <p className="text-sm">No revenue data available</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Movies */}
      <div className="bg-gray-800/50 p-6 rounded-lg border border-white/10">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Film className="w-5 h-5" />
          Top Performing Movies
        </h3>
        <div className="space-y-3">
          {analytics.movies && analytics.movies.length > 0 ? (
            analytics.movies.slice(0, 5).map((movie, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold">{movie.title}</div>
                    <div className="text-sm text-gray-400">
                      {movie.totalBookings} bookings • Rating: {movie.avgRating?.toFixed(1) || 'N/A'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-500">
                    {formatCurrency(movie.totalRevenue)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-400 py-8">
              <Film className="w-8 h-8 mx-auto mb-2 text-gray-500" />
              <p className="text-sm">No movie performance data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Peak Hours */}
      <div className="bg-gray-800/50 p-6 rounded-lg border border-white/10">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Peak Booking Hours
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {analytics.peakHours && analytics.peakHours.length > 0 ? (
            analytics.peakHours.map((peak, index) => (
              <div key={index} className="p-4 bg-gray-700/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {peak.hour}:00
                </div>
                <div className="text-sm text-gray-400">
                  {peak.bookings} bookings
                </div>
                <div className="text-sm text-green-500">
                  {formatCurrency(peak.revenue)}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-400 py-8">
              <Clock className="w-8 h-8 mx-auto mb-2 text-gray-500" />
              <p className="text-sm">No peak hours data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Live Occupancy */}
      {realtime?.liveOccupancy && realtime.liveOccupancy.length > 0 && (
        <div className="bg-gray-800/50 p-6 rounded-lg border border-white/10">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Live Show Occupancy
          </h3>
          <div className="space-y-3">
            {realtime.liveOccupancy.map((show, index) => (
              <div key={index} className="p-3 bg-gray-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{show.movie}</span>
                  <span className="text-sm text-gray-400">
                    {show.occupiedSeats}/{show.capacity} seats
                  </span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      show.occupancy >= 80 ? 'bg-red-500' :
                      show.occupancy >= 60 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${show.occupancy}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  {show.occupancy}% occupied
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
