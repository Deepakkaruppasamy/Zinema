import React, { useEffect, useState } from 'react';
import MovieCard from './MovieCard';
import BlurCircle from './BlurCircle';
import { useAppContext } from '../context/AppContext';

const Section = ({ title, movies, loading }) => (
  <div className='relative my-10'>
    <h2 className='text-lg font-semibold mb-4'>{title}</h2>
    {loading ? (
      <div className='text-sm text-gray-400'>Loading...</div>
    ) : movies.length === 0 ? (
      <div className='text-sm text-gray-400'>No items to show</div>
    ) : (
      <div className='flex flex-wrap gap-6'>
        {movies.map((m) => (
          <MovieCard key={m._id} movie={m} />
        ))}
      </div>
    )}
  </div>
);

const PersonalizedCarousel = () => {
  const { axios, getToken } = useAppContext();
  const [trending, setTrending] = useState([]);
  const [forYou, setForYou] = useState([]);
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState({ trending: true, forYou: true, feed: true });

  useEffect(() => {
    let cancelled = false;
    const fetchTrending = async () => {
      try {
        const { data } = await axios.get('/api/discovery/trending');
        if (!cancelled && data.success) setTrending(data.movies || []);
      } finally {
        if (!cancelled) setLoading((l) => ({ ...l, trending: false }));
      }
    };
    const fetchForYou = async () => {
      try {
        const { data } = await axios.get('/api/user/favorites', { headers: { Authorization: `Bearer ${await getToken()}` } });
        if (!cancelled && data.success) setForYou(data.movies || []);
      } finally {
        if (!cancelled) setLoading((l) => ({ ...l, forYou: false }));
      }
    };
    const fetchFeed = async () => {
      try {
        const { data } = await axios.get('/api/discovery/feed');
        if (!cancelled && data.success) setFeed(data.movies || []);
      } finally {
        if (!cancelled) setLoading((l) => ({ ...l, feed: false }));
      }
    };
    fetchTrending();
    fetchForYou();
    fetchFeed();
    return () => {
      cancelled = true;
    };
  }, [axios]);

  return (
    <div className='relative my-20 px-6 md:px-16 lg:px-40'>
      <BlurCircle top='-80px' left='-80px' />
      <BlurCircle bottom='-40px' right='-40px' />
      <Section title='For You' movies={forYou} loading={loading.forYou} />
      <Section title='From people you follow' movies={feed} loading={loading.feed} />
      <Section title='Trending Now' movies={trending} loading={loading.trending} />
    </div>
  );
};

export default PersonalizedCarousel;
