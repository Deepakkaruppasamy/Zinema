import React from 'react';
import { X } from 'lucide-react';

const TrailerModal = ({ open, onClose, title }) => {
  if (!open) return null;
  const q = encodeURIComponent(`${title} official trailer`);
  const origin = (typeof window !== 'undefined' && window.location && window.location.origin) ? window.location.origin : '';
  // Include origin param to avoid postMessage origin mismatch warnings from YouTube widget
  const src = `https://www.youtube-nocookie.com/embed?listType=search&list=${q}&autoplay=1&modestbranding=1&rel=0&playsinline=1&origin=${encodeURIComponent(origin)}`;
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10">
        <button onClick={onClose} className="absolute -top-10 right-0 text-white/80 hover:text-white inline-flex items-center gap-2">
          <X className="w-5 h-5" /> Close
        </button>
        <iframe
          className="w-full h-full"
          src={src}
          title={`${title} trailer`}
          sandbox="allow-scripts allow-same-origin allow-presentation"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          referrerPolicy="origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default TrailerModal;
