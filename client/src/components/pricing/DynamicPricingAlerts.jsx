import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  BellOff, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock,
  AlertTriangle,
  CheckCircle,
  Settings,
  Target,
  Zap
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const DynamicPricingAlerts = () => {
  const { axios, getToken, user } = useAppContext();
  const [alerts, setAlerts] = useState([]);
  const [priceHistory, setPriceHistory] = useState({});
  const [alertSettings, setAlertSettings] = useState({
    priceIncreaseThreshold: 10, // percentage
    priceDecreaseThreshold: 15,
    seatAvailabilityThreshold: 20, // percentage
    timeBeforeShow: 24, // hours
    enabled: true
  });
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (user) {
      loadPricingAlerts();
      loadPriceHistory();
    }
  }, [user]);

  const loadPricingAlerts = async () => {
    try {
      const { data } = await axios.get('/api/user/pricing-alerts', {
        headers: { Authorization: `Bearer ${await getToken()}` }
      });
      
      if (data.success) {
        setAlerts(data.alerts);
      }
    } catch (error) {
      console.error('Error loading pricing alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPriceHistory = async () => {
    try {
      const { data } = await axios.get('/api/pricing/history');
      
      if (data.success) {
        setPriceHistory(data.history);
      }
    } catch (error) {
      console.error('Error loading price history:', error);
    }
  };

  const createPriceAlert = async (movieId, showId, targetPrice, alertType) => {
    try {
      const { data } = await axios.post('/api/user/pricing-alerts', {
        movieId,
        showId,
        targetPrice,
        alertType, // 'increase', 'decrease', 'availability'
        threshold: alertSettings.priceIncreaseThreshold,
        enabled: true
      }, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      });
      
      if (data.success) {
        setAlerts(prev => [...prev, data.alert]);
        toast.success('Price alert created!');
      }
    } catch (error) {
      console.error('Error creating price alert:', error);
      toast.error('Failed to create price alert');
    }
  };

  const updateAlert = async (alertId, updates) => {
    try {
      const { data } = await axios.put(`/api/user/pricing-alerts/${alertId}`, updates, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      });
      
      if (data.success) {
        setAlerts(prev => prev.map(alert => 
          alert.id === alertId ? { ...alert, ...updates } : alert
        ));
        toast.success('Alert updated!');
      }
    } catch (error) {
      console.error('Error updating alert:', error);
      toast.error('Failed to update alert');
    }
  };

  const deleteAlert = async (alertId) => {
    try {
      const { data } = await axios.delete(`/api/user/pricing-alerts/${alertId}`, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      });
      
      if (data.success) {
        setAlerts(prev => prev.filter(alert => alert.id !== alertId));
        toast.success('Alert deleted!');
      }
    } catch (error) {
      console.error('Error deleting alert:', error);
      toast.error('Failed to delete alert');
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      const { data } = await axios.post('/api/user/alert-settings', newSettings, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      });
      
      if (data.success) {
        setAlertSettings(prev => ({ ...prev, ...newSettings }));
        toast.success('Settings updated!');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    }
  };

  const getPriceTrend = (movieId, showId) => {
    const history = priceHistory[movieId]?.[showId] || [];
    if (history.length < 2) return 'stable';
    
    const recent = history[history.length - 1];
    const previous = history[history.length - 2];
    const change = ((recent.price - previous.price) / previous.price) * 100;
    
    if (change > 5) return 'increasing';
    if (change < -5) return 'decreasing';
    return 'stable';
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'decreasing': return <TrendingDown className="w-4 h-4 text-green-500" />;
      default: return <DollarSign className="w-4 h-4 text-gray-500" />;
    }
  };

  const getAlertStatus = (alert) => {
    const now = new Date();
    const showTime = new Date(alert.showDateTime);
    const hoursUntilShow = (showTime - now) / (1000 * 60 * 60);
    
    if (hoursUntilShow < 0) return { status: 'expired', text: 'Expired' };
    if (hoursUntilShow < alertSettings.timeBeforeShow) return { status: 'urgent', text: 'Urgent' };
    if (alert.triggered) return { status: 'triggered', text: 'Triggered' };
    return { status: 'active', text: 'Active' };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'expired': return 'text-gray-400';
      case 'urgent': return 'text-red-400';
      case 'triggered': return 'text-green-400';
      case 'active': return 'text-blue-400';
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
          <Bell className="w-6 h-6 text-yellow-400" />
          <h2 className="text-2xl font-bold text-white">Dynamic Pricing Alerts</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-gray-800/50 rounded-lg border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Alert Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Price Increase Threshold (%)
              </label>
              <input
                type="number"
                value={alertSettings.priceIncreaseThreshold}
                onChange={(e) => setAlertSettings(prev => ({ 
                  ...prev, 
                  priceIncreaseThreshold: parseInt(e.target.value) 
                }))}
                className="w-full p-2 bg-gray-700 border border-white/10 rounded-lg text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Price Decrease Threshold (%)
              </label>
              <input
                type="number"
                value={alertSettings.priceDecreaseThreshold}
                onChange={(e) => setAlertSettings(prev => ({ 
                  ...prev, 
                  priceDecreaseThreshold: parseInt(e.target.value) 
                }))}
                className="w-full p-2 bg-gray-700 border border-white/10 rounded-lg text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Seat Availability Threshold (%)
              </label>
              <input
                type="number"
                value={alertSettings.seatAvailabilityThreshold}
                onChange={(e) => setAlertSettings(prev => ({ 
                  ...prev, 
                  seatAvailabilityThreshold: parseInt(e.target.value) 
                }))}
                className="w-full p-2 bg-gray-700 border border-white/10 rounded-lg text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Alert Before Show (hours)
              </label>
              <input
                type="number"
                value={alertSettings.timeBeforeShow}
                onChange={(e) => setAlertSettings(prev => ({ 
                  ...prev, 
                  timeBeforeShow: parseInt(e.target.value) 
                }))}
                className="w-full p-2 bg-gray-700 border border-white/10 rounded-lg text-white"
              />
            </div>
          </div>
          
          <div className="mt-4 flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={alertSettings.enabled}
                onChange={(e) => setAlertSettings(prev => ({ 
                  ...prev, 
                  enabled: e.target.checked 
                }))}
                className="rounded border-white/10 bg-gray-700 text-primary"
              />
              <span className="text-white">Enable all alerts</span>
            </label>
          </div>
          
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => updateSettings(alertSettings)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
            >
              Save Settings
            </button>
            <button
              onClick={() => setShowSettings(false)}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Alerts List */}
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="text-center py-12">
            <BellOff className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No pricing alerts set up yet</p>
            <p className="text-sm text-gray-500">
              Create alerts to get notified when ticket prices change
            </p>
          </div>
        ) : (
          alerts.map((alert) => {
            const alertStatus = getAlertStatus(alert);
            const priceTrend = getPriceTrend(alert.movieId, alert.showId);
            
            return (
              <div
                key={alert.id}
                className="bg-gray-800/50 rounded-lg border border-white/10 p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-white">
                      {alert.movieTitle}
                    </h3>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(priceTrend)}
                      <span className="text-sm text-gray-400">
                        {new Date(alert.showDateTime).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(alertStatus.status)}`}>
                      {alertStatus.text}
                    </span>
                    <button
                      onClick={() => updateAlert(alert.id, { enabled: !alert.enabled })}
                      className={`p-1 rounded transition-colors ${
                        alert.enabled 
                          ? 'text-green-400 hover:text-green-300' 
                          : 'text-gray-400 hover:text-gray-300'
                      }`}
                    >
                      {alert.enabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Current Price:</span>
                    <span className="text-white font-semibold ml-2">${alert.currentPrice}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Target Price:</span>
                    <span className="text-white font-semibold ml-2">${alert.targetPrice}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Alert Type:</span>
                    <span className="text-white font-semibold ml-2 capitalize">{alert.alertType}</span>
                  </div>
                </div>
                
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => deleteAlert(alert.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => updateAlert(alert.id, { triggered: false })}
                    className="px-3 py-1 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                  >
                    Reset
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Price Trends */}
      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-500/30 p-6">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-6 h-6 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Market Insights</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {Object.values(priceHistory).flat().filter(h => h.trend === 'decreasing').length}
            </div>
            <div className="text-gray-400">Prices Dropping</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">
              {Object.values(priceHistory).flat().filter(h => h.trend === 'increasing').length}
            </div>
            <div className="text-gray-400">Prices Rising</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {alerts.filter(a => a.enabled).length}
            </div>
            <div className="text-gray-400">Active Alerts</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicPricingAlerts;
