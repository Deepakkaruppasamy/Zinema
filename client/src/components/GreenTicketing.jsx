import React, { useState, useEffect } from 'react';
import { Leaf, X, Heart, TreePine } from 'lucide-react';

const GreenTicketing = () => {
  const [isVisible, setIsVisible] = useState(() => {
    // Check if user has permanently disabled it
    const permanentlyDisabled = localStorage.getItem('green_ticketing_permanently_disabled');
    if (permanentlyDisabled === 'true') {
      return false;
    }
    
    // Check if temporarily dismissed
    const dismissedUntil = localStorage.getItem('green_ticketing_dismissed_until');
    if (dismissedUntil) {
      const dismissalTime = parseInt(dismissedUntil);
      if (Date.now() < dismissalTime) {
        return false;
      } else {
        // Dismissal expired, remove it
        localStorage.removeItem('green_ticketing_dismissed_until');
      }
    }
    
    return true; // Default to visible
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [direction, setDirection] = useState({ x: 1, y: 1 });
  const [isDonationEnabled, setIsDonationEnabled] = useState(() => {
    return localStorage.getItem('green_ticketing_enabled') === 'true';
  });
  const [totalDonations, setTotalDonations] = useState(() => {
    return parseInt(localStorage.getItem('green_ticketing_total') || '0');
  });

  // Listen for booking completions to update total donations
  useEffect(() => {
    const handleBookingComplete = (event) => {
      const { greenDonation } = event.detail || {};
      if (greenDonation && greenDonation > 0) {
        setTotalDonations(prev => {
          const newTotal = prev + greenDonation;
          localStorage.setItem('green_ticketing_total', newTotal.toString());
          return newTotal;
        });
      }
    };

    const handleShowGreenTicketing = () => {
      setIsVisible(true);
      setIsExpanded(true); // Auto-expand when manually shown
    };

    // Periodic reminder - show every 30 minutes if not permanently disabled
    const checkPeriodicReminder = () => {
      const permanentlyDisabled = localStorage.getItem('green_ticketing_permanently_disabled');
      const lastReminder = localStorage.getItem('green_ticketing_last_reminder');
      const now = Date.now();
      
      if (permanentlyDisabled !== 'true') {
        if (!lastReminder || (now - parseInt(lastReminder)) > (30 * 60 * 1000)) { // 30 minutes
          setIsVisible(true);
          localStorage.setItem('green_ticketing_last_reminder', now.toString());
        }
      }
    };

    // Check reminder every 5 minutes
    const reminderInterval = setInterval(checkPeriodicReminder, 5 * 60 * 1000);
    
    // Initial check
    checkPeriodicReminder();

    window.addEventListener('greenTicketingDonation', handleBookingComplete);
    window.addEventListener('showGreenTicketing', handleShowGreenTicketing);
    
    return () => {
      window.removeEventListener('greenTicketingDonation', handleBookingComplete);
      window.removeEventListener('showGreenTicketing', handleShowGreenTicketing);
      clearInterval(reminderInterval);
    };
  }, []);

  // Floating animation
  useEffect(() => {
    if (!isVisible || isExpanded) return;

    const animate = () => {
      setPosition(prev => {
        const speed = 0.8;
        const maxX = window.innerWidth - 80;
        const maxY = window.innerHeight - 80;
        
        let newX = prev.x + direction.x * speed;
        let newY = prev.y + direction.y * speed;
        let newDirectionX = direction.x;
        let newDirectionY = direction.y;

        // Bounce off edges
        if (newX <= 20 || newX >= maxX) {
          newDirectionX = -direction.x;
          newX = Math.max(20, Math.min(maxX, newX));
        }
        if (newY <= 20 || newY >= maxY) {
          newDirectionY = -direction.y;
          newY = Math.max(20, Math.min(maxY, newY));
        }

        if (newDirectionX !== direction.x || newDirectionY !== direction.y) {
          setDirection({ x: newDirectionX, y: newDirectionY });
        }

        return { x: newX, y: newY };
      });
    };

    const interval = setInterval(animate, 50);
    return () => clearInterval(interval);
  }, [isVisible, isExpanded, direction]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => ({
        x: Math.min(prev.x, window.innerWidth - 80),
        y: Math.min(prev.y, window.innerHeight - 80)
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleDonation = () => {
    const newState = !isDonationEnabled;
    setIsDonationEnabled(newState);
    localStorage.setItem('green_ticketing_enabled', newState.toString());
  };

  const handleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleClose = () => {
    setIsVisible(false);
    // Set a temporary dismissal that expires after 1 hour
    const dismissalTime = Date.now() + (60 * 60 * 1000); // 1 hour from now
    localStorage.setItem('green_ticketing_dismissed_until', dismissalTime.toString());
  };

  // Check if user dismissed it temporarily
  useEffect(() => {
    const dismissedUntil = localStorage.getItem('green_ticketing_dismissed_until');
    if (dismissedUntil) {
      const dismissalTime = parseInt(dismissedUntil);
      if (Date.now() < dismissalTime) {
        setIsVisible(false);
        // Set a timer to make it visible again when dismissal expires
        const timeUntilVisible = dismissalTime - Date.now();
        setTimeout(() => {
          setIsVisible(true);
          localStorage.removeItem('green_ticketing_dismissed_until');
        }, timeUntilVisible);
      } else {
        // Dismissal has expired, remove it and show the component
        localStorage.removeItem('green_ticketing_dismissed_until');
        setIsVisible(true);
      }
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className="fixed z-50 transition-all duration-300 ease-out"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: isExpanded ? 'scale(1)' : 'scale(1)',
      }}
    >
      {/* Floating Icon */}
      {!isExpanded && (
        <div
          onClick={handleExpand}
          className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-lg cursor-pointer 
                     flex items-center justify-center hover:scale-110 transition-all duration-300 
                     animate-pulse hover:animate-none group relative"
        >
          <Leaf className="w-8 h-8 text-white group-hover:rotate-12 transition-transform duration-300" />
          
          {/* Floating particles effect */}
          <div className="absolute inset-0 rounded-full">
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-300 rounded-full animate-ping opacity-75"></div>
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-emerald-300 rounded-full animate-ping opacity-50" style={{ animationDelay: '0.5s' }}></div>
          </div>

          {/* Donation count badge */}
          {totalDonations > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {totalDonations}
            </div>
          )}
        </div>
      )}

      {/* Expanded Panel */}
      {isExpanded && (
        <div className="bg-white dark:bg-gray-800 cinema:bg-gray-900/90 cinema:backdrop-blur-sm rounded-xl shadow-2xl p-6 w-80 border border-gray-200 dark:border-gray-700 cinema:border-green-500/30">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white cinema:text-green-100">Green Ticketing 🌱</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 cinema:text-green-300">Carbon Neutral Movies</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cinema:hover:text-green-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-4">
            <div className="text-sm text-gray-700 dark:text-gray-300 cinema:text-green-200">
              <p className="mb-2">Make your movie experience carbon neutral!</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 cinema:text-green-400">
                Add just <span className="font-semibold text-green-600 dark:text-green-400 cinema:text-green-300">₹1 per ticket</span> to offset carbon emissions from your cinema visit.
              </p>
            </div>

            {/* Toggle Switch */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 cinema:bg-green-900/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <TreePine className="w-4 h-4 text-green-600 dark:text-green-400 cinema:text-green-300" />
                <span className="text-sm font-medium text-gray-900 dark:text-white cinema:text-green-100">
                  Auto-donate ₹1
                </span>
              </div>
              <button
                onClick={toggleDonation}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                  isDonationEnabled 
                    ? 'bg-green-600' 
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isDonationEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 cinema:bg-green-900/40 rounded-lg">
                <div className="text-lg font-bold text-green-600 dark:text-green-400 cinema:text-green-300">
                  ₹{totalDonations}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 cinema:text-green-400">
                  Total Donated
                </div>
              </div>
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 cinema:bg-blue-900/40 rounded-lg">
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400 cinema:text-blue-300 flex items-center justify-center">
                  <Heart className="w-4 h-4 mr-1" />
                  {Math.floor(totalDonations / 10)}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 cinema:text-blue-400">
                  Trees Planted
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={() => setIsExpanded(false)}
                className="flex-1 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 cinema:bg-gray-800 text-gray-700 dark:text-gray-300 cinema:text-green-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 cinema:hover:bg-gray-700 transition-colors"
              >
                Minimize
              </button>
              <button
                onClick={() => {
                  // This would typically open a modal with more details
                  alert('🌱 Green Ticketing Program\n\nOur carbon offset program partners with verified environmental organizations to:\n\n• Plant trees in deforested areas\n• Support renewable energy projects\n• Fund clean water initiatives\n• Reduce carbon emissions\n\nEvery ₹1 donation helps offset approximately 1kg of CO₂ emissions from your cinema visit.\n\nTogether, we can make entertainment more sustainable!');
                }}
                className="flex-1 px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors cinema:bg-green-500 cinema:hover:bg-green-600"
              >
                Learn More
              </button>
            </div>

            {/* Settings */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 cinema:border-green-500/30">
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to permanently disable Green Ticketing? You can re-enable it from the navbar leaf icon.')) {
                    localStorage.setItem('green_ticketing_permanently_disabled', 'true');
                    setIsVisible(false);
                  }
                }}
                className="w-full text-xs text-gray-500 dark:text-gray-400 cinema:text-green-400 hover:text-gray-700 dark:hover:text-gray-300 cinema:hover:text-green-300 transition-colors"
              >
                Disable permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GreenTicketing;
