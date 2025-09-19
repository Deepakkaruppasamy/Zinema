import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

const PWAInstallPrompt = () => {
  const [deferred, setDeferred] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onBeforeInstallPrompt = (e) => {
      // Use a custom install UI instead of the mini-infobar
      e.preventDefault();
      setDeferred(e);
      setVisible(true);
    };

    const onAppInstalled = () => {
      // Hide CTA once app is installed and clear deferred
      setVisible(false);
      setDeferred(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  if (!visible || !deferred) return null;

  const onInstall = async () => {
    try {
      deferred.prompt();
      await deferred.userChoice; // { outcome: 'accepted' | 'dismissed', platform: ... }
    } finally {
      // Clear regardless of outcome to avoid repeated prompts
      setVisible(false);
      setDeferred(null);
    }
  };

  return (
    <button
      onClick={onInstall}
      className="fixed bottom-6 left-6 z-50 rounded-full px-4 py-2 shadow-lg border border-gray-700 bg-gray-900/90 text-white backdrop-blur hover:bg-gray-800 transition-colors flex items-center gap-2"
    >
      <Download className="w-4 h-4 text-primary" /> Install App
    </button>
  );
};

export default PWAInstallPrompt;
