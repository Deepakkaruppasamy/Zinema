import { checkAndTriggerAlerts } from '../controllers/pricingAlertController.js';

const checkPricingAlerts = async () => {
  try {
    console.log('Checking pricing alerts...');
    const triggeredAlerts = await checkAndTriggerAlerts();
    
    if (triggeredAlerts.length > 0) {
      console.log(`Triggered ${triggeredAlerts.length} pricing alerts`);
    }
  } catch (error) {
    console.error('Error checking pricing alerts:', error);
  }
};

const startPricingAlertService = () => {
  checkPricingAlerts();
  
  setInterval(checkPricingAlerts, 5 * 60 * 1000);
  
  console.log('Pricing alert service started');
};

export { startPricingAlertService };
