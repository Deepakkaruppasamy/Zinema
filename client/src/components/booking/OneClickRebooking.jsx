import React, { useState, useEffect } from 'react';
import { 
  RotateCcw, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Star,
  Zap,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const OneClickRebooking = ({ previousBooking, isOpen, onClose }) => {
  const { axios, getToken } = useAppContext();
  const navigate = useNavigate();
  const [availableShows, setAvailableShows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedShow, setSelectedShow] = useState(null);
  const [rebookingOptions, setRebookingOptions] = useState({
    sameMovie: true,
    sameTime: false,
    sameSeats: true,
    flexibleDates: true
  });

  useEffect(() => {
    if (isOpen && previousBooking) {
      findAvailableShows();
    }
  }, [isOpen, previousBooking]);

  const findAvailableShows = async () => {
    if (!previousBooking?.show?.movie?._id) return;
    
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/show/${previousBooking.show.movie._id}`);
      
      if (data.success) {
        const allShows = [];
        Object.entries(data.dateTime || {}).forEach(([date, shows]) => {
          shows.forEach(show => {
            allShows.push({
              ...show,
              date,
              movie: data.movie
            });
          });
        });
        
        // Filter shows based on preferences
        let filteredShows = allShows;
        
        if (rebookingOptions.sameTime) {
          const originalTime = new Date(previousBooking.show.showDateTime).toTimeString();
          filteredShows = filteredShows.filter(show => 
            new Date(show.time).toTimeString() === originalTime
          );
        }
        
        if (rebookingOptions.sameSeats) {
          // Check if same seats are available
          filteredShows = filteredShows.filter(show => {
            // This would check seat availability in a real implementation
            return true;
          });
        }
        
        // Sort by date and time
        filteredShows.sort((a, b) => new Date(a.time) - new Date(b.time));
        
        setAvailableShows(filteredShows);
      }
    } catch (error) {
      console.error('Error finding shows:', error);
      toast.error('Failed to find available shows');
    } finally {
      setLoading(false);
    }
  };

  const handleRebook = async (show) => {
    if (!show) return;
    
    try {
      // Navigate to seat selection with pre-selected seats
      const seatParams = rebookingOptions.sameSeats ? 
        previousBooking.bookedSeats.join(',') : '';
      
      navigate(`/movies/${show.movie._id}/${show.date}?seats=${seatParams}&rebook=true`);
      onClose();
      toast.success('Redirecting to seat selection...');
    } catch (error) {
      console.error('Rebooking error:', error);
      toast.error('Failed to start rebooking process');
    }
  };

  const quickRebook = async () => {
    if (availableShows.length === 0) {
      toast.error('No available shows found');
      return;
    }
    
    // Find the best match
    const bestMatch = availableShows.find(show => {
      if (rebookingOptions.sameTime) {
        const originalTime = new Date(previousBooking.show.showDateTime).toTimeString();
        return new Date(show.time).toTimeString() === originalTime;
      }
      return true;
    }) || availableShows[0];
    
    await handleRebook(bestMatch);
  };

  const getShowStatus = (show) => {
    const now = new Date();
    const showTime = new Date(show.time);
    const timeDiff = showTime.getTime() - now.getTime();
    const hoursUntilShow = timeDiff / (1000 * 60 * 60);
    
    if (hoursUntilShow < 0) return { status: 'past', text: 'Past' };
    if (hoursUntilShow < 2) return { status: 'soon', text: 'Soon' };
    if (hoursUntilShow < 24) return { status: 'today', text: 'Today' };
    return { status: 'future', text: 'Available' };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'past': return 'text-red-400';
      case 'soon': return 'text-yellow-400';
      case 'today': return 'text-green-400';
      case 'future': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  if (!isOpen || !previousBooking) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg border border-white/10 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <RotateCcw className="w-6 h-6 text-blue-400" />
            <h3 className="text-xl font-semibold text-white">One-Click Rebooking</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            ×
          </button>
        </div>

        {/* Previous Booking Info */}
        <div className="p-6 border-b border-white/10">
          <h4 className="text-lg font-medium text-white mb-4">Previous Booking</h4>
          <div className="bg-gray-800/50 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span className="text-white font-medium">
                {previousBooking.show?.movie?.title || 'Unknown Movie'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-400" />
              <span className="text-gray-300">
                {new Date(previousBooking.show?.showDateTime).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              <span className="text-gray-300">
                Seats: {previousBooking.bookedSeats?.join(', ') || 'Unknown'}
              </span>
            </div>
          </div>
        </div>

        {/* Rebooking Options */}
        <div className="p-6 border-b border-white/10">
          <h4 className="text-lg font-medium text-white mb-4">Rebooking Preferences</h4>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={rebookingOptions.sameMovie}
                onChange={(e) => setRebookingOptions(prev => ({ 
                  ...prev, 
                  sameMovie: e.target.checked 
                }))}
                className="rounded border-white/10 bg-gray-700 text-primary"
              />
              <span className="text-gray-300">Same movie</span>
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={rebookingOptions.sameTime}
                onChange={(e) => setRebookingOptions(prev => ({ 
                  ...prev, 
                  sameTime: e.target.checked 
                }))}
                className="rounded border-white/10 bg-gray-700 text-primary"
              />
              <span className="text-gray-300">Same time slot</span>
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={rebookingOptions.sameSeats}
                onChange={(e) => setRebookingOptions(prev => ({ 
                  ...prev, 
                  sameSeats: e.target.checked 
                }))}
                className="rounded border-white/10 bg-gray-700 text-primary"
              />
              <span className="text-gray-300">Same seats (if available)</span>
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={rebookingOptions.flexibleDates}
                onChange={(e) => setRebookingOptions(prev => ({ 
                  ...prev, 
                  flexibleDates: e.target.checked 
                }))}
                className="rounded border-white/10 bg-gray-700 text-primary"
              />
              <span className="text-gray-300">Show flexible dates</span>
            </label>
          </div>
        </div>

        {/* Available Shows */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-white">Available Shows</h4>
            <button
              onClick={findAvailableShows}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : availableShows.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <p className="text-gray-400">No available shows found matching your criteria</p>
            </div>
          ) : (
            <div className="space-y-3">
              {availableShows.slice(0, 10).map((show, index) => {
                const showStatus = getShowStatus(show);
                const isSelected = selectedShow?._id === show._id;
                
                return (
                  <div
                    key={show._id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-primary bg-primary/10' 
                        : 'border-white/10 bg-gray-800/50 hover:bg-gray-800'
                    }`}
                    onClick={() => setSelectedShow(show)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-400" />
                          <span className="text-white font-medium">
                            {new Date(show.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-green-400" />
                          <span className="text-gray-300">
                            {new Date(show.time).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(showStatus.status)}`}>
                          {showStatus.text}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-primary font-semibold">${show.showPrice || 12}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRebook(show);
                          }}
                          className="px-3 py-1 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors text-sm"
                        >
                          Rebook
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="p-6 border-t border-white/10">
          <div className="flex gap-3">
            <button
              onClick={quickRebook}
              disabled={availableShows.length === 0}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap className="w-5 h-5" />
              Quick Rebook (Best Match)
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OneClickRebooking;
