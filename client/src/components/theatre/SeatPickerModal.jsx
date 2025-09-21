import React, { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';

const ROWS = 'ABCDEFGHIJ'.split('');
const COLS = Array.from({ length: 12 }, (_, i) => i + 1);

export default function SeatPickerModal({ open, onClose, theatreName, showtime, showId, onConfirm }) {
  const [occupied, setOccupied] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (!open || !showId) return;
    const controller = new AbortController();
    setLoading(true);
    setError('');
    fetch(`${import.meta.env.VITE_BASE_URL || 'https://zinema-clvk.onrender.com'}/api/booking/seats/${showId}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        if (data?.success) {
          const occ = new Set(Object.keys(data.seats || {}).filter((k) => data.seats[k]));
          setOccupied(occ);
        } else {
          setError(data?.message || 'Failed to load seats');
        }
      })
      .catch((e) => {
        if (e.name !== 'AbortError') setError('Failed to load seats');
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [open, showId]);

  const capacityInfo = useMemo(() => {
    const total = ROWS.length * COLS.length;
    const occ = occupied.size;
    const avail = total - occ;
    return { total, occ, avail, pct: Math.round((occ / total) * 100) };
  }, [occupied]);

  const toggleSeat = (id) => {
    if (occupied.has(id)) return;
    setSelected((prev) => {
      const exists = prev.includes(id);
      if (exists) return prev.filter((s) => s !== id);
      if (prev.length >= 6) return prev; // limit 6
      return [...prev, id];
    });
  };

  const reset = () => setSelected([]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-gray-900 w-full max-w-3xl rounded-2xl border border-white/10 p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xl font-bold text-primary">Select Seats</h3>
            <div className="text-sm text-gray-300">{theatreName} • {showtime}</div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5"><X className="w-5 h-5 text-gray-300" /></button>
        </div>

        {loading ? (
          <div className="h-48 flex items-center justify-center text-gray-400">Loading seats…</div>
        ) : error ? (
          <div className="h-48 flex items-center justify-center text-red-400">{error}</div>
        ) : (
          <>
            <div className="mb-2 text-xs text-gray-400">Screen this side</div>
            <div className="grid grid-cols-12 gap-1 mb-3">
              {ROWS.map((r) => (
                <React.Fragment key={r}>
                  {COLS.map((c, idx) => {
                    const id = `${r}${c}`;
                    const aisle = (idx === 5);
                    const isOccupied = occupied.has(id);
                    const isSelected = selected.includes(id);
                    return (
                      <div
                        key={id}
                        onClick={() => toggleSeat(id)}
                        className={
                          `h-5 rounded cursor-pointer ${
                            aisle ? 'bg-transparent' : isOccupied ? 'bg-red-500/70 cursor-not-allowed' : isSelected ? 'bg-primary' : 'bg-gray-600 hover:bg-gray-500'
                          }`
                        }
                        title={id}
                      />
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
              <span className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-gray-600 inline-block"/> Available</span>
              <span className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-red-500/70 inline-block"/> Occupied</span>
              <span className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-primary inline-block"/> Selected</span>
              <span className="ml-auto">Capacity: {capacityInfo.pct}% filled</span>
            </div>
          </>
        )}

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-300">Selected: {selected.join(', ') || 'None'} ({selected.length}/6)</div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-200 hover:bg-white/10" onClick={reset}>Reset</button>
            <button
              className="px-4 py-2 rounded-xl bg-primary text-black font-semibold disabled:opacity-60"
              disabled={selected.length === 0}
              onClick={() => onConfirm?.(selected)}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
