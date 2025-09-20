import PricingAlert from '../models/PricingAlert.js';
import Show from '../models/Show.js';
import Booking from '../models/Booking.js';

// Get user pricing alerts
export const getPricingAlerts = async (req, res) => {
  try {
    const { userId } = req.user;
    
    const alerts = await PricingAlert.find({ userId }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      alerts
    });
  } catch (error) {
    console.error('Error getting pricing alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pricing alerts'
    });
  }
};

// Create pricing alert
export const createPricingAlert = async (req, res) => {
  try {
    const { userId } = req.user;
    const { movieId, movieTitle, showId, showDateTime, alertType, targetPrice, threshold } = req.body;
    
    // Get current price from show
    const show = await Show.findById(showId);
    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found'
      });
    }
    
    const currentPrice = show.price || 10; // Default price if not set
    
    const alert = new PricingAlert({
      userId,
      movieId,
      movieTitle,
      showId,
      showDateTime: new Date(showDateTime),
      alertType,
      targetPrice,
      currentPrice,
      threshold
    });
    
    await alert.save();
    
    res.json({
      success: true,
      message: 'Pricing alert created',
      alert
    });
  } catch (error) {
    console.error('Error creating pricing alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create pricing alert'
    });
  }
};

// Update pricing alert
export const updatePricingAlert = async (req, res) => {
  try {
    const { userId } = req.user;
    const { alertId } = req.params;
    const updates = req.body;
    
    const alert = await PricingAlert.findOneAndUpdate(
      { _id: alertId, userId },
      updates,
      { new: true }
    );
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Alert updated',
      alert
    });
  } catch (error) {
    console.error('Error updating pricing alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update alert'
    });
  }
};

// Delete pricing alert
export const deletePricingAlert = async (req, res) => {
  try {
    const { userId } = req.user;
    const { alertId } = req.params;
    
    const result = await PricingAlert.findOneAndDelete({ _id: alertId, userId });
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Alert deleted'
    });
  } catch (error) {
    console.error('Error deleting pricing alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete alert'
    });
  }
};

// Get price history
export const getPriceHistory = async (req, res) => {
  try {
    const { movieId, showId } = req.query;
    
    // This would typically come from a price history collection
    // For now, we'll simulate some data
    const history = [
      { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), price: 12, trend: 'stable' },
      { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), price: 11, trend: 'decreasing' },
      { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), price: 13, trend: 'increasing' },
      { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), price: 12, trend: 'stable' },
      { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), price: 10, trend: 'decreasing' },
      { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), price: 11, trend: 'increasing' },
      { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), price: 12, trend: 'stable' },
      { date: new Date(), price: 12, trend: 'stable' }
    ];
    
    res.json({
      success: true,
      history: { [movieId]: { [showId]: history } }
    });
  } catch (error) {
    console.error('Error getting price history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get price history'
    });
  }
};

// Check and trigger alerts (internal function)
export const checkAndTriggerAlerts = async () => {
  try {
    const activeAlerts = await PricingAlert.find({ 
      enabled: true, 
      triggered: false,
      showDateTime: { $gte: new Date() }
    }).maxTimeMS(5000); // Add timeout
    
    const triggeredAlerts = [];
    
    for (const alert of activeAlerts) {
      // Get current show data
      const show = await Show.findById(alert.showId);
      if (!show) continue;
      
      const currentPrice = show.price || 10;
      const priceChange = ((currentPrice - alert.currentPrice) / alert.currentPrice) * 100;
      
      let shouldTrigger = false;
      
      switch (alert.alertType) {
        case 'increase':
          shouldTrigger = priceChange >= alert.threshold;
          break;
        case 'decrease':
          shouldTrigger = priceChange <= -alert.threshold;
          break;
        case 'availability':
          // Check seat availability
          const bookings = await Booking.find({ showId: alert.showId, isPaid: true });
          const totalSeats = 120; // Assuming 120 seats per show
          const occupancyRate = (bookings.length / totalSeats) * 100;
          shouldTrigger = occupancyRate >= alert.threshold;
          break;
        case 'time_based':
          const hoursUntilShow = (new Date(alert.showDateTime) - new Date()) / (1000 * 60 * 60);
          shouldTrigger = hoursUntilShow <= alert.threshold;
          break;
      }
      
      if (shouldTrigger) {
        alert.triggered = true;
        alert.triggeredAt = new Date();
        alert.currentPrice = currentPrice;
        await alert.save();
        
        triggeredAlerts.push(alert);
        
        // Here you would send notifications to the user
        // await sendPricingAlertNotification(alert);
      } else {
        // Update current price
        alert.currentPrice = currentPrice;
        alert.lastChecked = new Date();
        await alert.save();
      }
    }
    
    return triggeredAlerts;
  } catch (error) {
    // Only log timeout errors, not all errors
    if (error.name === 'MongooseError' && error.message.includes('buffering timed out')) {
      console.log('Pricing alerts check skipped due to database timeout');
    } else {
      console.error('Error checking pricing alerts:', error);
    }
    return [];
  }
};

// Get alert statistics
export const getAlertStats = async (req, res) => {
  try {
    const { userId } = req.user;
    
    const stats = await PricingAlert.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: ['$enabled', 1, 0] } },
          triggered: { $sum: { $cond: ['$triggered', 1, 0] } },
          byType: {
            $push: {
              type: '$alertType',
              enabled: '$enabled',
              triggered: '$triggered'
            }
          }
        }
      }
    ]);
    
    const result = stats[0] || { total: 0, active: 0, triggered: 0, byType: [] };
    
    res.json({
      success: true,
      stats: result
    });
  } catch (error) {
    console.error('Error getting alert stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get alert stats'
    });
  }
};
