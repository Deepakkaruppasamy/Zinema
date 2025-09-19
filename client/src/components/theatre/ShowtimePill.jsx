import React from 'react';
import { Clock } from 'lucide-react';

const colorFromCapacity = (pct) => {
  if (pct >= 70) return 'bg-green-600/20 text-green-300 border-green-500/30';
  if (pct >= 40) return 'bg-yellow-600/20 text-yellow-200 border-yellow-500/30';
  return 'bg-red-600/20 text-red-300 border-red-500/30';
};

const ShowtimePill = ({ time, capacityPct = 50, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full border ${colorFromCapacity(capacityPct)} hover:brightness-110 inline-flex items-center gap-2 text-sm transition`}
      title={`~${capacityPct}% seats available`}
    >
      <Clock className="w-4 h-4" />
      {time}
    </button>
  );
};

export default ShowtimePill;
