import React, { useEffect, useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import MovieCard from './MovieCard';

const SectionRow = ({ title, movies }) => (
  <section className="mt-16 px-6 md:px-16 lg:px-36 xl:px-44">
    <h2 className="text-2xl font-bold mb-6 text-white">{title}</h2>
    <div className="flex overflow-x-auto gap-6 pb-2 scrollbar-thin scrollbar-thumb-primary/30">
      {movies.map(movie => (
        <div key={movie._id} className="min-w-[260px]">
          <MovieCard movie={movie} />
        </div>
      ))}
    </div>
  </section>
);

const TopTrendingSection = () => {
  const { image_base_url } = useAppContext();
  const [topRated, setTopRated] = useState([]);
  const [trending, setTrending] = useState([]);

  const apiKey = import.meta.env.VITE_TMDB_API_KEY;
  let bearer = import.meta.env.VITE_TMDB_BEARER;
  const apiKeyLooksJwt = apiKey && typeof apiKey === 'string' && apiKey.startsWith('eyJ');
  if (!bearer && apiKeyLooksJwt) bearer = apiKey;
  const language = import.meta.env.VITE_TMDB_LANG || 'en-US';
  const posterBase = useMemo(() => image_base_url || 'https://image.tmdb.org/t/p/w500', [image_base_url]);

  useEffect(() => {
    const fetchList = async (url) => {
      const res = await fetch(url, { headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined });
      if (!res.ok) throw new Error('TMDB fetch failed');
      const data = await res.json();
      return (data.results || []).map(m => ({
        _id: m.id, // adapt for MovieCard links
        title: m.title,
        release_date: m.release_date || '2025-01-01',
        genres: (m.genre_ids || []).slice(0,2).map(id => ({ id, name: `#${id}` })),
        runtime: 120,
        backdrop_path: m.backdrop_path || m.poster_path || '',
        vote_average: m.vote_average || 0,
        popularity: m.popularity || 0,
        poster: m.poster_path ? `${posterBase}${m.poster_path}` : '',
      }));
    };

    const run = async () => {
      try {
        const base = 'https://api.themoviedb.org/3';
        const topUrl = bearer ? `${base}/movie/top_rated?language=${language}&page=1` : `${base}/movie/top_rated?api_key=${apiKey}&language=${language}&page=1`;
        const trendUrl = bearer ? `${base}/trending/movie/day?language=${language}` : `${base}/trending/movie/day?api_key=${apiKey}&language=${language}`;
        const [tRated, tTrend] = await Promise.all([
          fetchList(topUrl),
          fetchList(trendUrl),
        ]);
        setTopRated(tRated.slice(0,8));
        setTrending(tTrend.slice(0,8));
      } catch (e) {
        console.debug('Top/Trending API error:', e);
      }
    };
    run();
  }, [apiKey, bearer, language, posterBase]);

  if (!topRated.length && !trending.length) return null;

  return (
    <>
      <SectionRow title="Top Rated" movies={topRated} />
      <SectionRow title="Trending Now" movies={trending} />
    </>
  );
};

export default TopTrendingSection;
