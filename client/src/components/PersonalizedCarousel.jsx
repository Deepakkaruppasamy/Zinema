import React, { useEffect, useState } from 'react';
import MovieCard from './MovieCard';
import BlurCircle from './BlurCircle';
import { useAppContext } from '../context/AppContext';
import { Brain, Star, TrendingUp, Heart, Zap } from 'lucide-react';

const Section = ({ title, movies, loading, icon, subtitle, aiPowered = false }) => (
  <div className='relative my-10'>
    <div className="flex items-center gap-3 mb-4">
      {icon}
      <div>
        <h2 className='text-lg font-semibold flex items-center gap-2'>
          {title}
          {aiPowered && (
            <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full text-xs">
              <Brain className="w-3 h-3" />
              <span>AI</span>
            </div>
          )}
        </h2>
        {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
      </div>
    </div>
    {loading ? (
      <div className='text-sm text-gray-400 flex items-center gap-2'>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        {aiPowered ? 'AI is analyzing your preferences...' : 'Loading...'}
      </div>
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
  const { axios, getToken, user } = useAppContext();
  const [trending, setTrending] = useState([]);
  const [forYou, setForYou] = useState([]);
  const [feed, setFeed] = useState([]);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [loading, setLoading] = useState({ 
    trending: true, 
    forYou: true, 
    feed: true, 
    aiRecommendations: true,
    similarMovies: true,
    newReleases: true
  });

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

    // AI-powered recommendations
    const fetchAIRecommendations = async () => {
      try {
        if (user) {
          const { data } = await axios.get('/api/discovery/ai-recommendations', { 
            headers: { Authorization: `Bearer ${await getToken()}` } 
          });
          if (!cancelled && data.success) setAiRecommendations(data.movies || []);
        }
      } finally {
        if (!cancelled) setLoading((l) => ({ ...l, aiRecommendations: false }));
      }
    };

    const fetchSimilarMovies = async () => {
      try {
        const { data } = await axios.get('/api/discovery/similar');
        if (!cancelled && data.success) setSimilarMovies(data.movies || []);
      } finally {
        if (!cancelled) setLoading((l) => ({ ...l, similarMovies: false }));
      }
    };

    const fetchNewReleases = async () => {
      try {
        const { data } = await axios.get('/api/discovery/new-releases');
        if (!cancelled && data.success) setNewReleases(data.movies || []);
      } finally {
        if (!cancelled) setLoading((l) => ({ ...l, newReleases: false }));
      }
    };

    fetchTrending();
    fetchForYou();
    fetchFeed();
    fetchAIRecommendations();
    fetchSimilarMovies();
    fetchNewReleases();
    
    return () => {
      cancelled = true;
    };
  }, [axios, user]);

  return (
    <div className='relative my-20 px-6 md:px-16 lg:px-40'>
      <BlurCircle top='-80px' left='-80px' />
      <BlurCircle bottom='-40px' right='-40px' />
      
      {/* AI-Powered Recommendations */}
      {user && (
        <Section 
          title='Recommended for You' 
          movies={aiRecommendations} 
          loading={loading.aiRecommendations}
          icon={<Brain className="w-5 h-5 text-purple-400" />}
          subtitle="Based on your viewing history and preferences"
          aiPowered={true}
        />
      )}
      
      <Section 
        title='New Releases' 
        movies={newReleases} 
        loading={loading.newReleases}
        icon={<Zap className="w-5 h-5 text-yellow-400" />}
        subtitle="Fresh movies just added to our collection"
      />
      
      <Section 
        title='Similar to Your Favorites' 
        movies={similarMovies} 
        loading={loading.similarMovies}
        icon={<Heart className="w-5 h-5 text-red-400" />}
        subtitle="Movies you might enjoy based on your taste"
      />
      
      <Section 
        title='For You' 
        movies={forYou} 
        loading={loading.forYou}
        icon={<Star className="w-5 h-5 text-blue-400" />}
        subtitle="Your personal favorites"
      />
      
      <Section 
        title='From people you follow' 
        movies={feed} 
        loading={loading.feed}
        icon={<TrendingUp className="w-5 h-5 text-green-400" />}
        subtitle="What your friends are watching"
      />
      
      <Section 
        title='Trending Now' 
        movies={trending} 
        loading={loading.trending}
        icon={<TrendingUp className="w-5 h-5 text-orange-400" />}
        subtitle="What's popular right now"
      />
    </div>
  );
};

export default PersonalizedCarousel;
