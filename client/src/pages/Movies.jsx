import React, { useState, useMemo, useEffect } from 'react'
import MovieCard from '../components/MovieCard'
import BlurCircle from '../components/BlurCircle'
import { useAppContext } from '../context/AppContext'
import { Search, XCircle, Filter, Sparkles, SlidersHorizontal, Clock, Languages } from 'lucide-react'

const Movies = () => {
  const { shows } = useAppContext();

  const [selectedGenre, setSelectedGenre] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const [sortBy, setSortBy] = useState('popularity');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [minRating, setMinRating] = useState(0); // 0 - 10
  const [maxDuration, setMaxDuration] = useState(240); // minutes
  const [onlyUpcoming, setOnlyUpcoming] = useState(false);
  const [nowPlaying, setNowPlaying] = useState(false);
  const years = useMemo(() => {
    const list = shows.map(m => new Date(m.release_date).getFullYear()).filter(Boolean);
    const min = list.length ? Math.min(...list) : 1980;
    const max = list.length ? Math.max(...list) : new Date().getFullYear();
    return { min, max };
  }, [shows]);
  const [yearFrom, setYearFrom] = useState(() => new Date().getFullYear() - 10);
  const [yearTo, setYearTo] = useState(() => new Date().getFullYear());
  const languages = useMemo(() => {
    const set = new Set(
      shows.map(m => m.original_language).filter(Boolean)
    );
    return Array.from(set);
  }, [shows]);
  const [selectedLangs, setSelectedLangs] = useState([]);

  // debounce search to avoid jitter
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 250);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Load filters from URL or localStorage on mount
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const q = url.searchParams;
      const ls = localStorage.getItem('movies.filters');
      const saved = ls ? JSON.parse(ls) : {};

      const get = (key, fallback) => (q.get(key) ?? saved[key] ?? fallback);

      const sg = get('genre', 'All');
      const st = get('q', '');
      const sb = get('sort', 'popularity');
      const yf = Number(get('yf', yearFrom));
      const yt = Number(get('yt', yearTo));
      const mr = Number(get('min', 0));
      const md = Number(get('maxd', 240));
      const langs = (get('langs', '') || '').split(',').filter(Boolean);
      const up = get('up', false);
      const np = get('now', false);

      setSelectedGenre(typeof sg === 'string' ? sg : 'All');
      setSearchTerm(typeof st === 'string' ? st : '');
      setSortBy(['popularity','rating','newest'].includes(sb) ? sb : 'popularity');
      setYearFrom(Number.isFinite(yf) ? yf : yearFrom);
      setYearTo(Number.isFinite(yt) ? yt : yearTo);
      setMinRating(Number.isFinite(mr) ? mr : 0);
      setMaxDuration(Number.isFinite(md) ? md : 240);
      setSelectedLangs(Array.isArray(langs) ? langs : []);
      setOnlyUpcoming(up === '1' || up === true || up === 'true');
      setNowPlaying(np === '1' || np === true || np === 'true');
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clamp year range when show years computed or external set
  useEffect(() => {
    setYearFrom(prev => Math.max(years.min, Math.min(prev, yearTo)));
    setYearTo(prev => Math.min(years.max, Math.max(prev, yearFrom)));
  }, [years.min, years.max]);

  // Sync filters to URL and localStorage
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedGenre !== 'All') params.set('genre', selectedGenre);
    if (searchTerm) params.set('q', searchTerm);
    if (sortBy !== 'popularity') params.set('sort', sortBy);
    if (yearFrom !== years.min) params.set('yf', String(yearFrom));
    if (yearTo !== years.max) params.set('yt', String(yearTo));
    if (minRating > 0) params.set('min', String(minRating));
    if (maxDuration < 240) params.set('maxd', String(maxDuration));
    if (selectedLangs.length > 0) params.set('langs', selectedLangs.join(','));
    if (onlyUpcoming) params.set('up', '1');
    if (nowPlaying) params.set('now', '1');

    const qs = params.toString();
    const next = `${window.location.pathname}${qs ? `?${qs}` : ''}`;
    window.history.replaceState(null, '', next);

    localStorage.setItem('movies.filters', JSON.stringify({
      genre: selectedGenre,
      q: searchTerm,
      sort: sortBy,
      yf: yearFrom,
      yt: yearTo,
      min: minRating,
      maxd: maxDuration,
      langs: selectedLangs,
      up: onlyUpcoming,
      now: nowPlaying,
    }));
  }, [selectedGenre, searchTerm, sortBy, yearFrom, yearTo, minRating, maxDuration, selectedLangs, onlyUpcoming, nowPlaying, years.min, years.max]);

  // Get all unique genres from shows
  const genres = useMemo(() => {
    const set = new Set();
    shows.forEach(movie => movie.genres.forEach(g => set.add(g.name)));
    return ['All', ...Array.from(set).sort()];
  }, [shows]);

  // Filtered movies by genre and search
  const filteredMovies = useMemo(() => {
    return shows.filter(movie => {
      const matchesGenre = selectedGenre === 'All' || movie.genres.some(g => g.name === selectedGenre);
      const matchesSearch = movie.title.toLowerCase().includes(debouncedSearch.toLowerCase());
      const y = new Date(movie.release_date).getFullYear();
      const withinYear = isFinite(y) ? (y >= yearFrom && y <= yearTo) : true;
      const ratingOk = (movie.vote_average ?? 0) >= minRating;
      const durationOk = (movie.runtime ?? 0) <= maxDuration;
      const langOk = selectedLangs.length === 0 || selectedLangs.includes(movie.original_language);
      const today = new Date();
      const rd = new Date(movie.release_date);
      const upcomingOk = onlyUpcoming ? rd > today : true;
      const nowWindowStart = new Date(); nowWindowStart.setDate(nowWindowStart.getDate() - 45);
      const nowOk = nowPlaying ? (rd <= today && rd >= nowWindowStart) : true;
      return matchesGenre && matchesSearch && withinYear && ratingOk && durationOk && langOk && upcomingOk && nowOk;
    });
  }, [shows, selectedGenre, debouncedSearch, yearFrom, yearTo, minRating, maxDuration, selectedLangs, onlyUpcoming, nowPlaying]);

  const sortedMovies = useMemo(() => {
    const arr = [...filteredMovies];
    if (sortBy === 'rating') arr.sort((a,b) => b.vote_average - a.vote_average);
    else if (sortBy === 'newest') arr.sort((a,b) => new Date(b.release_date) - new Date(a.release_date));
    else arr.sort((a,b) => (b.popularity ?? 0) - (a.popularity ?? 0));
    return arr;
  }, [filteredMovies, sortBy]);

  // Suggestions for search
  const suggestions = useMemo(() => {
    if (!searchTerm) return [];
    return shows.filter(m => m.title.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 5);
  }, [shows, searchTerm]);

  // Handlers
  const handleGenreClick = (genre) => {
    setSelectedGenre(genre);
    setSearchTerm('');
    setShowSuggestions(false);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowSuggestions(true);
    setHighlighted(-1);
  };

  const handleSuggestionClick = (title) => {
    setSearchTerm(title);
    setShowSuggestions(false);
  };

  const handleSearchBlur = () => {
    setTimeout(() => setShowSuggestions(false), 100);
  };

  return shows.length > 0 ? (
    <div className='relative my-40 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]'>
      <BlurCircle top="150px" left="0px"/>
      <BlurCircle bottom="50px" right="50px"/>

      {/* Sticky glass filter bar */}
      <div className="sticky top-20 z-20 bg-gray-900/70 backdrop-blur border border-white/10 rounded-2xl p-4 flex flex-col gap-4 shadow-lg mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Search */}
          <div className="relative w-full md:w-1/2">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              className="w-full pl-9 pr-10 py-2 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-primary/60 placeholder:text-gray-400"
              placeholder="Search movies, actors, genres..."
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => setShowSuggestions(true)}
              onBlur={handleSearchBlur}
              aria-label="Search movies"
            />
            {searchTerm && (
              <button aria-label="Clear search" onMouseDown={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                <XCircle className="w-4 h-4" />
              </button>
            )}
            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute left-0 right-0 bg-gray-800/95 border border-white/10 rounded-xl mt-2 z-10 max-h-56 overflow-y-auto backdrop-blur">
                {suggestions.map((movie, idx) => (
                  <li
                    key={movie._id}
                    className={`px-4 py-2 cursor-pointer hover:bg-primary/10 ${highlighted === idx ? 'bg-primary/20' : ''}`}
                    onMouseDown={() => handleSuggestionClick(movie.title)}
                  >
                    {movie.title}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* Sort */}
          <div className="flex items-center gap-2 md:ml-auto">
            <span className="inline-flex items-center gap-2 text-sm text-gray-300"><Filter className="w-4 h-4"/> Sort by</span>
            <select id="sort" value={sortBy} onChange={(e)=>setSortBy(e.target.value)} className="bg-gray-900/60 border border-white/10 text-gray-200 text-sm rounded-xl px-3 py-2">
              <option value="popularity">Popularity</option>
              <option value="rating">Rating</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>

        {/* Selected filters chips row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 text-xs text-gray-300"><Sparkles className="w-3.5 h-3.5"/> Filters</span>
            {selectedGenre !== 'All' && (
              <button onClick={() => setSelectedGenre('All')} className="px-3 py-1 rounded-full bg-primary/15 text-primary border border-primary/30 text-xs">{selectedGenre} ×</button>
            )}
            {debouncedSearch && (
              <button onClick={() => setSearchTerm('')} className="px-3 py-1 rounded-full bg-white/10 text-gray-200 border border-white/15 text-xs">“{debouncedSearch}” ×</button>
            )}
            {(yearFrom !== years.min || yearTo !== years.max) && (
              <button onClick={() => { setYearFrom(years.min); setYearTo(years.max); }} className="px-3 py-1 rounded-full bg-white/10 text-gray-200 border border-white/15 text-xs">{yearFrom}-{yearTo} ×</button>
            )}
            {minRating > 0 && (
              <button onClick={() => setMinRating(0)} className="px-3 py-1 rounded-full bg-white/10 text-gray-200 border border-white/15 text-xs">Rating ≥ {minRating} ×</button>
            )}
            {maxDuration < 240 && (
              <button onClick={() => setMaxDuration(240)} className="px-3 py-1 rounded-full bg-white/10 text-gray-200 border border-white/15 text-xs">≤ {maxDuration}m ×</button>
            )}
            {selectedLangs.map(l => (
              <button key={l} onClick={() => setSelectedLangs(selectedLangs.filter(x => x !== l))} className="px-3 py-1 rounded-full bg-white/10 text-gray-200 border border-white/15 text-xs">{l.toUpperCase()} ×</button>
            ))}
            {onlyUpcoming && (
              <button onClick={() => setOnlyUpcoming(false)} className="px-3 py-1 rounded-full bg-white/10 text-gray-200 border border-white/15 text-xs">Upcoming ×</button>
            )}
            {nowPlaying && (
              <button onClick={() => setNowPlaying(false)} className="px-3 py-1 rounded-full bg-white/10 text-gray-200 border border-white/15 text-xs">Now Playing ×</button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowAdvanced(v => !v)} className="text-xs text-gray-200 bg-white/10 hover:bg-white/15 border border-white/15 px-3 py-1 rounded-full inline-flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5"/> {showAdvanced ? 'Hide' : 'More'} filters
            </button>
            <button onClick={() => { setSelectedGenre('All'); setSearchTerm(''); setMinRating(0); setMaxDuration(240); setYearFrom(years.min); setYearTo(years.max); setSelectedLangs([]); setOnlyUpcoming(false); setNowPlaying(false); }} className="text-xs text-gray-300 hover:text-white underline">Clear all</button>
          </div>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 text-xs text-gray-300"><Sparkles className="w-3.5 h-3.5"/> Presets</span>
          <button onClick={() => { setMinRating(7.5); }} className="px-3 py-1 rounded-full border text-xs bg-white/5 text-gray-200 border-white/10 hover:bg-primary/10">Top Rated</button>
          <button onClick={() => { const y = new Date().getFullYear(); setYearFrom(y-1); setYearTo(y); }} className="px-3 py-1 rounded-full border text-xs bg-white/5 text-gray-200 border-white/10 hover:bg-primary/10">New Releases</button>
          <button onClick={() => { setMaxDuration(120); }} className="px-3 py-1 rounded-full border text-xs bg-white/5 text-gray-200 border-white/10 hover:bg-primary/10">Short (&lt;120m)</button>
          <button onClick={() => { setMaxDuration(240); setMinRating(8.5); }} className="px-3 py-1 rounded-full border text-xs bg-white/5 text-gray-200 border-white/10 hover:bg-primary/10">Award‑worthy</button>
          <button onClick={() => { setSelectedGenre('Family'); }} className="px-3 py-1 rounded-full border text-xs bg-white/5 text-gray-200 border-white/10 hover:bg-primary/10">Family</button>
          <button onClick={() => { setSelectedGenre('Action'); }} className="px-3 py-1 rounded-full border text-xs bg-white/5 text-gray-200 border-white/10 hover:bg-primary/10">Action</button>
          <button onClick={() => { setOnlyUpcoming(true); setNowPlaying(false); }} className="px-3 py-1 rounded-full border text-xs bg-white/5 text-gray-200 border-white/10 hover:bg-primary/10">Upcoming</button>
          <button onClick={() => { setNowPlaying(true); setOnlyUpcoming(false); }} className="px-3 py-1 rounded-full border text-xs bg-white/5 text-gray-200 border-white/10 hover:bg-primary/10">Now Playing</button>
        </div>

        {/* Year quick pills */}
        <div className="overflow-x-auto no-scrollbar -mx-2 px-2 mt-2">
          <div className="flex items-center gap-2 w-max">
            {[
              {label:'All Years', fn: () => { setYearFrom(years.min); setYearTo(years.max); }},
              {label:'This Year', fn: () => { const y = new Date().getFullYear(); setYearFrom(y); setYearTo(y); }},
              {label:'Last Year', fn: () => { const y = new Date().getFullYear()-1; setYearFrom(y); setYearTo(y); }},
              {label:'2010s', fn: () => { setYearFrom(2010); setYearTo(2019); }},
              {label:'2000s', fn: () => { setYearFrom(2000); setYearTo(2009); }},
              {label:"90's", fn: () => { setYearFrom(1990); setYearTo(1999); }},
            ].map(p => (
              <button key={p.label} onClick={p.fn} className={`px-4 py-1 rounded-full border text-sm transition-all whitespace-nowrap bg-white/5 text-gray-200 border-white/10 hover:bg-primary/10`}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced filters panel */}
        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-900/40 border border-white/10 rounded-xl p-4">
            {/* Year Range */}
            <div>
              <div className="text-xs text-gray-300 mb-2">Year Range</div>
              <div className="flex items-center gap-3">
                <input type="number" className="w-24 bg-gray-900/60 border border-white/10 text-gray-200 text-sm rounded-xl px-3 py-2" min={years.min} max={yearTo} value={yearFrom} onChange={(e)=> setYearFrom(Math.min(Math.max(years.min, Number(e.target.value)||years.min), yearTo))} />
                <span className="text-gray-400">to</span>
                <input type="number" className="w-24 bg-gray-900/60 border border-white/10 text-gray-200 text-sm rounded-xl px-3 py-2" min={yearFrom} max={years.max} value={yearTo} onChange={(e)=> setYearTo(Math.max(Math.min(years.max, Number(e.target.value)||years.max), yearFrom))} />
              </div>
            </div>

            {/* Minimum Rating */}
            <div>
              <div className="text-xs text-gray-300 mb-2">Minimum Rating: <span className="text-primary font-semibold">{minRating}</span></div>
              <input type="range" min={0} max={10} step={0.5} value={minRating} onChange={(e)=> setMinRating(Number(e.target.value))} className="w-full" />
            </div>

            {/* Max Duration */}
            <div>
              <div className="text-xs text-gray-300 mb-2 inline-flex items-center gap-2"><Clock className="w-3.5 h-3.5"/> Max Duration: <span className="text-primary font-semibold">{maxDuration}m</span></div>
              <input type="range" min={60} max={240} step={10} value={maxDuration} onChange={(e)=> setMaxDuration(Number(e.target.value))} className="w-full" />
            </div>

            {/* Languages */}
            {languages.length > 0 && (
              <div className="md:col-span-3">
                <div className="text-xs text-gray-300 mb-2 inline-flex items-center gap-2"><Languages className="w-3.5 h-3.5"/> Languages</div>
                <div className="flex flex-wrap gap-2">
                  {languages.map(l => {
                    const active = selectedLangs.includes(l);
                    return (
                      <button key={l} onClick={() => setSelectedLangs(active ? selectedLangs.filter(x => x !== l) : [...selectedLangs, l])} className={`px-3 py-1 rounded-full border text-xs ${active ? 'bg-primary text-white border-primary' : 'bg-white/5 text-gray-200 border-white/10 hover:bg-primary/10'}`}>
                        {l.toUpperCase()}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Genres scroller */}
        <div className="overflow-x-auto no-scrollbar -mx-2 px-2">
          <div className="flex items-center gap-2 w-max">
            {genres.map(genre => (
              <button
                key={genre}
                className={`px-4 py-1 rounded-full border text-sm transition-all whitespace-nowrap ${selectedGenre === genre ? 'bg-primary text-white border-primary shadow' : 'bg-white/5 text-gray-200 border-white/10 hover:bg-primary/10'}`}
                onClick={() => handleGenreClick(genre)}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className='flex items-center justify-between my-4'>
        <h1 className='text-lg font-medium'>Now Showing</h1>
        <span className='text-sm text-gray-400'>{sortedMovies.length} results</span>
      </div>
      <div className='flex flex-wrap max-sm:justify-center gap-8'>
        {sortedMovies.length > 0 ? (
          sortedMovies.map((movie) => (
            <div key={movie._id} className="transform transition hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)]"> 
              <MovieCard movie={movie} />
            </div>
          ))
        ) : (
          <div className='w-full flex justify-center items-center text-gray-400 py-16'>
            <span>No movies found for your selection.</span>
          </div>
        )}
      </div>
    </div>
  ) : (
    <div className='flex flex-col items-center justify-center h-screen'>
      <h1 className='text-3xl font-bold text-center'>No movies available</h1>
    </div>
  );
}

export default Movies
