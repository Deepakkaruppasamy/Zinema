import React, { useState, useEffect } from 'react';
import { AlertTriangle, Users, DollarSign, Clock, TrendingDown, Shield, Activity } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const RiskManagement = () => {
  const { axios, getToken } = useAppContext();
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRiskData = async () => {
    try {
      const { data } = await axios.get('/api/admin/risk-flags', {
        headers: { Authorization: `Bearer ${await getToken()}` }
      });
      
      if (data.success) {
        setRiskData(data.flags);
      } else {
        toast.error(data.message || 'Failed to fetch risk data');
      }
    } catch (error) {
      console.error('Error fetching risk data:', error);
      toast.error('Failed to fetch risk data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiskData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchRiskData, 300000);
    return () => clearInterval(interval);
  }, []);

  const getRiskLevel = (score) => {
    if (score >= 70) return { level: 'High', color: 'text-red-500', bgColor: 'bg-red-500/10' };
    if (score >= 40) return { level: 'Medium', color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' };
    return { level: 'Low', color: 'text-green-500', bgColor: 'bg-green-500/10' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!riskData) {
    return (
      <div className="text-center text-gray-400 py-8">
        Failed to load risk data
      </div>
    );
  }

  const riskLevel = getRiskLevel(riskData.riskScore);

  return (
    <div className="space-y-6">
      {/* Risk Score Overview */}
      <div className={`p-6 rounded-xl border ${riskLevel.bgColor} border-current`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Overall Risk Score
          </h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${riskLevel.color} ${riskLevel.bgColor}`}>
            {riskLevel.level} Risk
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-3xl font-bold">{riskData.riskScore}/100</div>
          <div className="flex-1">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  riskData.riskScore >= 70 ? 'bg-red-500' : 
                  riskData.riskScore >= 40 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${riskData.riskScore}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 p-4 rounded-lg border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-gray-300">Heavy Users</span>
          </div>
          <div className="text-2xl font-bold text-orange-500">
            {riskData.heavyUsers.length}
          </div>
          <div className="text-xs text-gray-400">
            Users with 10+ bookings (7 days)
          </div>
        </div>

        <div className="bg-gray-800/50 p-4 rounded-lg border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-red-500" />
            <span className="text-sm text-gray-300">Zero Amount</span>
          </div>
          <div className="text-2xl font-bold text-red-500">
            {riskData.zeroPaid.length}
          </div>
          <div className="text-xs text-gray-400">
            Paid bookings with $0 amount
          </div>
        </div>

        <div className="bg-gray-800/50 p-4 rounded-lg border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-gray-300">Rapid Bookings</span>
          </div>
          <div className="text-2xl font-bold text-yellow-500">
            {riskData.rapidBookings}
          </div>
          <div className="text-xs text-gray-400">
            Bookings within 1 minute
          </div>
        </div>

        <div className="bg-gray-800/50 p-4 rounded-lg border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-gray-300">Cancellation Rate</span>
          </div>
          <div className="text-2xl font-bold text-purple-500">
            {riskData.cancellationRate}%
          </div>
          <div className="text-xs text-gray-400">
            Last 30 days
          </div>
        </div>
      </div>

      {/* Detailed Risk Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Heavy Users */}
        {riskData.heavyUsers.length > 0 && (
          <div className="bg-gray-800/50 p-4 rounded-lg border border-white/10">
            <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-500" />
              Heavy Users
            </h4>
            <div className="space-y-2">
              {riskData.heavyUsers.map((user, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-700/50 rounded">
                  <span className="text-sm font-mono">{user.user}</span>
                  <span className="text-sm text-orange-500 font-semibold">
                    {user.count} bookings
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Zero Amount Bookings */}
        {riskData.zeroPaid.length > 0 && (
          <div className="bg-gray-800/50 p-4 rounded-lg border border-white/10">
            <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-red-500" />
              Zero Amount Bookings
            </h4>
            <div className="space-y-2">
              {riskData.zeroPaid.slice(0, 5).map((booking, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-700/50 rounded">
                  <span className="text-sm font-mono">{booking._id.slice(-8)}</span>
                  <span className="text-sm text-red-500 font-semibold">
                    ${booking.amount}
                  </span>
                </div>
              ))}
              {riskData.zeroPaid.length > 5 && (
                <div className="text-xs text-gray-400 text-center">
                  ... and {riskData.zeroPaid.length - 5} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Revenue Anomalies */}
        {riskData.revenueAnomalies.length > 0 && (
          <div className="bg-gray-800/50 p-4 rounded-lg border border-white/10 lg:col-span-2">
            <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              Revenue Anomalies
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {riskData.revenueAnomalies.map((anomaly, index) => (
                <div key={index} className="p-2 bg-gray-700/50 rounded">
                  <div className="text-sm font-semibold">{anomaly.date}</div>
                  <div className="text-sm text-gray-300">
                    ${anomaly.revenue} ({anomaly.deviation}%)
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={fetchRiskData}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
        >
          Refresh Data
        </button>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Export Report
        </button>
      </div>
    </div>
  );
};

export default RiskManagement;
