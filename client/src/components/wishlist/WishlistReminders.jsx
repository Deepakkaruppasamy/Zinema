import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  HeartOff, 
  Bell, 
  BellOff, 
  Calendar, 
  Clock, 
  Star,
  Eye,
  Trash2,
  Plus,
  Filter,
  Search,
  AlertCircle,
  CheckCircle,
  Zap
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import MovieCard from '../MovieCard';
import toast from 'react-hot-toast';

const WishlistReminders = () => {
  const { axios, getToken, user } = useAppContext();
  const [wishlist, setWishlist] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('wishlist');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGenre, setFilterGenre] = useState('all');
  const [sortBy, setSortBy] = useState('dateAdded');

  useEffect(() => {
    if (user) {
      loadWishlist();
      loadReminders();
    }
  }, [user]);

  const loadWishlist = async () => {
    try {
      const { data } = await axios.get('/api/user/wishlist', {
        headers: { Authorization: `Bearer ${await getToken()}` }
      });
      
      if (data.success) {
        setWishlist(data.wishlist);
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReminders = async () => {
    try {
      const { data } = await axios.get('/api/user/reminders', {
        headers: { Authorization: `Bearer ${await getToken()}` }
      });
      
      if (data.success) {
        setReminders(data.reminders);
      }
    } catch (error) {
      console.error('Error loading reminders:', error);
    }
  };

  const addToWishlist = async (movie) => {
    try {
      const { data } = await axios.post('/api/user/wishlist', {
        movieId: movie._id,
        movieTitle: movie.title,
        moviePoster: movie.poster_path,
        addedAt: new Date()
      }, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      });
      
      if (data.success) {
        setWishlist(prev => [...prev, data.item]);
        toast.success('Added to wishlist!');
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error('Failed to add to wishlist');
    }
  };

  const removeFromWishlist = async (movieId) => {
    try {
      const { data } = await axios.delete(`/api/user/wishlist/${movieId}`, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      });
      
      if (data.success) {
        setWishlist(prev => prev.filter(item => item.movieId !== movieId));
        toast.success('Removed from wishlist');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove from wishlist');
    }
  };

  const createReminder = async (movieId, reminderType, reminderTime) => {
    try {
      const { data } = await axios.post('/api/user/reminders', {
        movieId,
        reminderType, // 'release', 'booking', 'showtime'
        reminderTime,
        enabled: true
      }, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      });
      
      if (data.success) {
        setReminders(prev => [...prev, data.reminder]);
        toast.success('Reminder created!');
      }
    } catch (error) {
      console.error('Error creating reminder:', error);
      toast.error('Failed to create reminder');
    }
  };

  const updateReminder = async (reminderId, updates) => {
    try {
      const { data } = await axios.put(`/api/user/reminders/${reminderId}`, updates, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      });
      
      if (data.success) {
        setReminders(prev => prev.map(reminder => 
          reminder.id === reminderId ? { ...reminder, ...updates } : reminder
        ));
        toast.success('Reminder updated!');
      }
    } catch (error) {
      console.error('Error updating reminder:', error);
      toast.error('Failed to update reminder');
    }
  };

  const deleteReminder = async (reminderId) => {
    try {
      const { data } = await axios.delete(`/api/user/reminders/${reminderId}`, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      });
      
      if (data.success) {
        setReminders(prev => prev.filter(reminder => reminder.id !== reminderId));
        toast.success('Reminder deleted');
      }
    } catch (error) {
      console.error('Error deleting reminder:', error);
      toast.error('Failed to delete reminder');
    }
  };

  const filteredWishlist = wishlist.filter(item => {
    const matchesSearch = item.movieTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = filterGenre === 'all' || item.genre === filterGenre;
    return matchesSearch && matchesGenre;
  });

  const sortedWishlist = filteredWishlist.sort((a, b) => {
    switch (sortBy) {
      case 'dateAdded':
        return new Date(b.addedAt) - new Date(a.addedAt);
      case 'title':
        return a.movieTitle.localeCompare(b.movieTitle);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      default:
        return 0;
    }
  });

  const getReminderStatus = (reminder) => {
    const now = new Date();
    const reminderTime = new Date(reminder.reminderTime);
    const timeDiff = reminderTime.getTime() - now.getTime();
    const hoursUntilReminder = timeDiff / (1000 * 60 * 60);
    
    if (hoursUntilReminder < 0) return { status: 'overdue', text: 'Overdue' };
    if (hoursUntilReminder < 24) return { status: 'soon', text: 'Soon' };
    if (reminder.triggered) return { status: 'triggered', text: 'Triggered' };
    return { status: 'scheduled', text: 'Scheduled' };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'overdue': return 'text-red-400';
      case 'soon': return 'text-yellow-400';
      case 'triggered': return 'text-green-400';
      case 'scheduled': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Heart className="w-6 h-6 text-red-400" />
          <h2 className="text-2xl font-bold text-white">Wishlist & Reminders</h2>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        <button
          onClick={() => setActiveTab('wishlist')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'wishlist'
              ? 'bg-primary text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          Wishlist ({wishlist.length})
        </button>
        <button
          onClick={() => setActiveTab('reminders')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'reminders'
              ? 'bg-primary text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          Reminders ({reminders.length})
        </button>
      </div>

      {/* Wishlist Tab */}
      {activeTab === 'wishlist' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search wishlist..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            
            <select
              value={filterGenre}
              onChange={(e) => setFilterGenre(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
            >
              <option value="all">All Genres</option>
              <option value="action">Action</option>
              <option value="comedy">Comedy</option>
              <option value="drama">Drama</option>
              <option value="horror">Horror</option>
              <option value="sci-fi">Sci-Fi</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
            >
              <option value="dateAdded">Date Added</option>
              <option value="title">Title</option>
              <option value="rating">Rating</option>
            </select>
          </div>

          {/* Wishlist Items */}
          {sortedWishlist.length === 0 ? (
            <div className="text-center py-12">
              <HeartOff className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">Your wishlist is empty</p>
              <p className="text-sm text-gray-500">
                Add movies to your wishlist to get notified about showtimes and releases
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedWishlist.map((item) => (
                <div key={item.id} className="relative group">
                  <MovieCard movie={item} />
                  
                  {/* Actions */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                      <button
                        onClick={() => createReminder(item.movieId, 'booking', new Date(Date.now() + 24 * 60 * 60 * 1000))}
                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                        title="Set Reminder"
                      >
                        <Bell className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeFromWishlist(item.movieId)}
                        className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                        title="Remove from Wishlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reminders Tab */}
      {activeTab === 'reminders' && (
        <div className="space-y-4">
          {reminders.length === 0 ? (
            <div className="text-center py-12">
              <BellOff className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No reminders set</p>
              <p className="text-sm text-gray-500">
                Create reminders to get notified about movie releases and booking opportunities
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reminders.map((reminder) => {
                const reminderStatus = getReminderStatus(reminder);
                
                return (
                  <div
                    key={reminder.id}
                    className="bg-gray-800/50 rounded-lg border border-white/10 p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-white">
                          {reminder.movieTitle}
                        </h3>
                        <span className="px-2 py-1 bg-blue-600 text-white rounded-full text-xs">
                          {reminder.reminderType}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reminderStatus.status)}`}>
                          {reminderStatus.text}
                        </span>
                        <button
                          onClick={() => updateReminder(reminder.id, { enabled: !reminder.enabled })}
                          className={`p-1 rounded transition-colors ${
                            reminder.enabled 
                              ? 'text-green-400 hover:text-green-300' 
                              : 'text-gray-400 hover:text-gray-300'
                          }`}
                        >
                          {reminder.enabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-400" />
                        <span className="text-gray-400">Reminder Time:</span>
                        <span className="text-white">
                          {new Date(reminder.reminderTime).toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-green-400" />
                        <span className="text-gray-400">Created:</span>
                        <span className="text-white">
                          {new Date(reminder.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => deleteReminder(reminder.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => updateReminder(reminder.id, { triggered: false })}
                        className="px-3 py-1 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-lg border border-red-500/30 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-6 h-6 text-red-400" />
          <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">
              {wishlist.length}
            </div>
            <div className="text-gray-400">Movies in Wishlist</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {reminders.filter(r => r.enabled).length}
            </div>
            <div className="text-gray-400">Active Reminders</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {reminders.filter(r => r.triggered).length}
            </div>
            <div className="text-gray-400">Notifications Sent</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishlistReminders;
