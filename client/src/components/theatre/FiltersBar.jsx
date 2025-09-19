import React from 'react';
import { MapPin, SlidersHorizontal, CalendarDays, Languages, MonitorPlay, Filter } from 'lucide-react';

const FiltersBar = ({ city, setCity, date, setDate, format, setFormat, language, setLanguage, sortBy, setSortBy, onOpenFilters }) => {
  const minDate = new Date().toISOString().slice(0,10);
  return (
    <div className="sticky top-20 z-20 bg-gray-900/70 backdrop-blur border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between shadow-lg">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
          <MapPin className="w-4 h-4 text-primary" />
          <input
            value={city}
            onChange={e => setCity(e.target.value)}
            placeholder="Search city"
            className="bg-transparent outline-none text-white placeholder-gray-400"
          />
        </div>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
          <CalendarDays className="w-4 h-4 text-primary" />
          <input
            type="date"
            value={date}
            min={minDate}
            onChange={e => setDate(e.target.value)}
            className="bg-transparent outline-none text-white [color-scheme:dark]"
          />
        </div>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
          <MonitorPlay className="w-4 h-4 text-primary" />
          <select value={format} onChange={e => setFormat(e.target.value)} className="bg-transparent outline-none text-white">
            <option className="bg-gray-900" value="Any">Any</option>
            <option className="bg-gray-900" value="2D">2D</option>
            <option className="bg-gray-900" value="3D">3D</option>
            <option className="bg-gray-900" value="IMAX">IMAX</option>
          </select>
        </div>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
          <Languages className="w-4 h-4 text-primary" />
          <select value={language} onChange={e => setLanguage(e.target.value)} className="bg-transparent outline-none text-white">
            <option className="bg-gray-900" value="Any">Any</option>
            <option className="bg-gray-900" value="English">English</option>
            <option className="bg-gray-900" value="Hindi">Hindi</option>
            <option className="bg-gray-900" value="Tamil">Tamil</option>
            <option className="bg-gray-900" value="Telugu">Telugu</option>
          </select>
        </div>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
          <Filter className="w-4 h-4 text-primary" />
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-transparent outline-none text-white">
            <option className="bg-gray-900" value="distance">Nearest</option>
            <option className="bg-gray-900" value="rating">Top Rated</option>
          </select>
        </div>
      </div>
      <button onClick={onOpenFilters} className="inline-flex items-center gap-2 bg-primary text-black px-4 py-2 rounded-xl font-semibold hover:bg-primary-dull transition">
        <SlidersHorizontal className="w-4 h-4" /> More filters
      </button>
    </div>
  );
};

export default FiltersBar;
