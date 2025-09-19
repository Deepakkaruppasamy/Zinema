import React from 'react';
import { MapPin, Star, Share2, Heart, BadgeInfo, Armchair, MonitorPlay, UtensilsCrossed } from 'lucide-react';
import ShowtimePill from './ShowtimePill';

const AmenityBadge = ({ icon, label }) => {
  const iconProps = { className: "w-3.5 h-3.5 text-primary" };
  let IconComponent = null;
  
  if (React.isValidElement(icon)) {
    // If icon is already a React element, clone it with our props
    IconComponent = React.cloneElement(icon, { ...iconProps, ...icon.props });
  } else if (typeof icon === 'function') {
    // If icon is a component constructor, create element
    IconComponent = React.createElement(icon, iconProps);
  } else {
    // Fallback to default icon
    IconComponent = <BadgeInfo {...iconProps} />;
  }
  
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-gray-200 bg-white/5 border border-white/10 px-2 py-1 rounded-full">
      {IconComponent} {label}
    </span>
  );
};

const amenityIconFor = (label) => {
  const key = (label || '').toLowerCase();
  if (key.includes('imax')) return MonitorPlay;
  if (key.includes('dolby')) return BadgeInfo;
  if (key.includes('recliner')) return Armchair;
  if (key.includes('f&b') || key.includes('food')) return UtensilsCrossed;
  return BadgeInfo;
};

const TheatreCard = ({ theatre, onQuickBook, onReport }) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-white/0 backdrop-blur-sm p-5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white">{theatre.name}</h3>
          <div className="mt-1 inline-flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">
              {theatre.offerLabel || 'WEEKEND50 · Save $50'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-300 text-sm">
            <MapPin className="w-4 h-4 text-primary" /> {theatre.distance} km • {theatre.area}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1 bg-yellow-500/20 text-yellow-200 px-2 py-1 rounded-full text-sm">
            <Star className="w-4 h-4" /> {theatre.rating}
          </div>
          <button className="p-2 rounded-lg hover:bg-white/10"><Share2 className="w-4 h-4 text-gray-300" /></button>
          <button className="p-2 rounded-lg hover:bg-white/10"><Heart className="w-4 h-4 text-gray-300" /></button>
          {onReport && (
            <button className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-gray-200" onClick={onReport}>Report</button>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {(theatre.amenities && theatre.amenities.length > 0 ? theatre.amenities : [
          { label: 'Dolby Atmos' },
          { label: 'Recliner Seats' },
          { label: 'F&B Available' },
        ]).map((a, i) => {
          const iconType = a.icon || amenityIconFor(a.label);
          return <AmenityBadge key={i} icon={iconType} label={a.label} />;
        })}
      </div>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
        {theatre.showtimes?.map((s, i) => (
          <ShowtimePill key={i} time={s.time} capacityPct={s.capacity} onClick={() => onQuickBook(s)} />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-300">
        <div className="inline-flex items-center gap-2"><BadgeInfo className="w-4 h-4" /> Cleanliness {theatre.metrics.cleanliness}/5 • Sound {theatre.metrics.sound}/5 • Seats {theatre.metrics.seats}/5</div>
        <div className="inline-flex items-center gap-3">
          <span className="inline-flex items-center gap-1"><MapPin className="w-4 h-4 text-primary" /> Nearby</span>
          <span className="inline-flex items-center gap-1"><Armchair className="w-4 h-4 text-primary" /> Recliner</span>
          <span className="inline-flex items-center gap-1"><UtensilsCrossed className="w-4 h-4 text-primary" /> F&B</span>
        </div>
      </div>
    </div>
  );
};

export default TheatreCard;
