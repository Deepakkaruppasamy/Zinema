import { checkAndTriggerAlerts } from '../controllers/pricingAlertController.js';

// Run pricing alert checks every 5 minutes
const checkPricingAlerts = async () => {
  try {
    console.log('Checking pricing alerts...');
    const triggeredAlerts = await checkAndTriggerAlerts();
    
    if (triggeredAlerts.length > 0) {
      console.log(`Triggered ${triggeredAlerts.length} pricing alerts`);
      // Here you would send notifications to users
      // await sendPricingAlertNotifications(triggeredAlerts);
    }
  } catch (error) {
    console.error('Error checking pricing alerts:', error);
  }
};

// Start the cron job
const startPricingAlertService = () => {
  // Check immediately on startup
  checkPricingAlerts();
  
  // Then check every 5 minutes
  setInterval(checkPricingAlerts, 5 * 60 * 1000);
  
  console.log('Pricing alert service started');
};

export { startPricingAlertService };
