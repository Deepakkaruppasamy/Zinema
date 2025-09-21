import React, { useState } from 'react';
import { X, CalendarPlus, Sparkles } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';

const QuickBookModal = ({ open, onClose, theatreName, showtime, onConfirm, showId, selectedSeats = ['A1','A2'] }) => {
  const { getToken, isSignedIn } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleConfirm = async () => {
    try {
      if (onConfirm) return onConfirm();
      if (!isSignedIn) {
        alert('Please sign in to continue.');
        return;
      }
      if (!showId) {
        alert('Show is not available. Please pick a valid showtime.');
        return;
      }
      setSubmitting(true);
      const token = await getToken();
      const res = await fetch(`${import.meta.env.VITE_BASE_URL || 'https://zinema-clvk.onrender.com'}/api/booking/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ showId, selectedSeats }),
      });
      const data = await res.json();
      if (data?.success && data?.url) {
        window.location.href = data.url; // Stripe Checkout
      } else {
        alert(data?.message || 'Failed to start payment.');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong while creating booking.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 w-full max-w-lg rounded-2xl border border-white/10 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-primary">Quick Book</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5"><X className="w-5 h-5 text-gray-300" /></button>
        </div>
        <div className="space-y-2 text-gray-200">
          <div className="text-sm">Theatre</div>
          <div className="text-lg font-semibold">{theatreName}</div>
          <div className="text-sm mt-4">Showtime</div>
          <div className="text-lg font-semibold">{showtime}</div>
          <div className="mt-6 p-3 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300">
            Seat map preview coming next. We'll auto-pick best seats in your preferred row.
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-200 hover:bg-white/10">Cancel</button>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-200 hover:bg-white/10 inline-flex items-center gap-2">
              <CalendarPlus className="w-4 h-4" /> Add to calendar
            </button>
            <button onClick={handleConfirm} disabled={submitting} className="px-4 py-2 rounded-xl bg-primary text-black font-semibold inline-flex items-center gap-2 disabled:opacity-60">
              <Sparkles className="w-4 h-4" /> {submitting ? 'Processing…' : 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickBookModal;
