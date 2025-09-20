import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Wifi, WifiOff, Bell, BellOff } from 'lucide-react';
import toast from 'react-hot-toast';

const PWAUtils = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [notificationPermission, setNotificationPermission] = useState('default');

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches || 
          window.navigator.standalone === true) {
        setIsInstalled(true);
      }
    };

    checkInstalled();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      toast.success('Zinema installed successfully!');
    };

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Check notification permission
    const checkNotificationPermission = () => {
      if ('Notification' in window) {
        setNotificationPermission(Notification.permission);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    checkNotificationPermission();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      toast.error('Install prompt not available');
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        toast.success('Installing Zinema...');
      } else {
        toast.error('Installation cancelled');
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error during installation:', error);
      toast.error('Installation failed');
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Notifications not supported');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        toast.success('Notifications enabled!');
        
        // Register for push notifications
        if ('serviceWorker' in navigator && 'PushManager' in window) {
          try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: process.env.VITE_VAPID_PUBLIC_KEY
            });
            
            // Send subscription to server
            console.log('Push subscription:', subscription);
            toast.success('Push notifications enabled!');
          } catch (error) {
            console.error('Error subscribing to push notifications:', error);
          }
        }
      } else {
        toast.error('Notification permission denied');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Failed to enable notifications');
    }
  };

  const sendTestNotification = () => {
    if (notificationPermission === 'granted') {
      new Notification('Zinema Test', {
        body: 'This is a test notification from Zinema!',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png'
      });
    }
  };

  if (isInstalled) {
    return null; // Don't show install prompt if already installed
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 space-y-2">
      {/* Install Prompt */}
      {deferredPrompt && (
        <div className="bg-gray-900 border border-primary/30 rounded-lg p-4 shadow-lg max-w-sm">
          <div className="flex items-center gap-3 mb-3">
            <Download className="w-5 h-5 text-primary" />
            <div>
              <h3 className="font-semibold text-white">Install Zinema</h3>
              <p className="text-sm text-gray-300">Get the full app experience</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleInstallClick}
              className="flex-1 bg-primary text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors"
            >
              Install
            </button>
            <button
              onClick={() => setDeferredPrompt(null)}
              className="px-3 py-2 text-gray-400 hover:text-white transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Connection Status */}
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
        isOnline ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
      }`}>
        {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
        <span>{isOnline ? 'Online' : 'Offline'}</span>
      </div>

      {/* Notification Controls */}
      {notificationPermission !== 'granted' && (
        <div className="bg-gray-900 border border-white/10 rounded-lg p-3 max-w-sm">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-white">Enable Notifications</span>
          </div>
          <button
            onClick={requestNotificationPermission}
            className="w-full bg-yellow-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors"
          >
            Enable
          </button>
        </div>
      )}

      {/* Test Notification (for development) */}
      {notificationPermission === 'granted' && process.env.NODE_ENV === 'development' && (
        <button
          onClick={sendTestNotification}
          className="flex items-center gap-2 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors"
        >
          <Bell className="w-4 h-4" />
          Test Notification
        </button>
      )}
    </div>
  );
};

export default PWAUtils;
