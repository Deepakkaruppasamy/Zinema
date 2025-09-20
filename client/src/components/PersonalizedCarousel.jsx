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

  // Mock data for when API calls fail
  const mockMovies = [
    {
      _id: '1',
      title: 'The Dark Knight',
      release_date: '2008-07-18',
      vote_average: 9.0,
      backdrop_path: '/hqkIcbrOHL86UncnHIsHVcVmzue.jpg',
      poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
      overview: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
      runtime: 152,
      genres: [
        { id: 28, name: 'Action' },
        { id: 80, name: 'Crime' },
        { id: 18, name: 'Drama' }
      ],
      price: 250
    },
    {
      _id: '2',
      title: 'Inception',
      release_date: '2010-07-16',
      vote_average: 8.8,
      backdrop_path: '/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',
      poster_path: '/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
      overview: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
      runtime: 148,
      genres: [
        { id: 28, name: 'Action' },
        { id: 878, name: 'Science Fiction' },
        { id: 53, name: 'Thriller' }
      ],
      price: 300
    },
    {
      _id: '3',
      title: 'Interstellar',
      release_date: '2014-11-07',
      vote_average: 8.6,
      backdrop_path: '/xu9zaAevzQ5nnrsXN6JcahLnG4i.jpg',
      poster_path: '/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg',
      overview: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
      runtime: 169,
      genres: [
        { id: 18, name: 'Drama' },
        { id: 878, name: 'Science Fiction' },
        { id: 53, name: 'Thriller' }
      ],
      price: 280
    },
    {
      _id: '4',
      title: 'The Matrix',
      release_date: '1999-03-31',
      vote_average: 8.7,
      backdrop_path: '/7u3pxc0K1wx0IweKzQYkMwFz2tD.jpg',
      poster_path: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
      overview: 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.',
      runtime: 136,
      genres: [
        { id: 28, name: 'Action' },
        { id: 878, name: 'Science Fiction' }
      ],
      price: 200
    },
    {
      _id: '5',
      title: 'Pulp Fiction',
      release_date: '1994-10-14',
      vote_average: 8.9,
      backdrop_path: '/4cDFJr4H91XNk4v1NpBfwdLzSB7.jpg',
      poster_path: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
      overview: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
      runtime: 154,
      genres: [
        { id: 80, name: 'Crime' },
        { id: 18, name: 'Drama' }
      ],
      price: 220
    },
    {
      _id: '6',
      title: 'The Shawshank Redemption',
      release_date: '1994-09-23',
      vote_average: 9.3,
      backdrop_path: '/iNh3BivHyg5sQRPP1KOkzguEX0H.jpg',
      poster_path: '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
      overview: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
      runtime: 142,
      genres: [
        { id: 18, name: 'Drama' }
      ],
      price: 180
    }
  ];

  useEffect(() => {
    let cancelled = false;
    
    const fetchTrending = async () => {
      try {
        const { data } = await axios.get('/api/discovery/trending');
        if (!cancelled && data.success) setTrending(data.movies || []);
      } catch (error) {
        // Use mock data when API fails
        if (!cancelled) setTrending(mockMovies.slice(0, 4));
      } finally {
        if (!cancelled) setLoading((l) => ({ ...l, trending: false }));
      }
    };
    
    const fetchForYou = async () => {
      try {
        const { data } = await axios.get('/api/user/favorites', { headers: { Authorization: `Bearer ${await getToken()}` } });
        if (!cancelled && data.success) setForYou(data.movies || []);
      } catch (error) {
        // Use mock data when API fails
        if (!cancelled) setForYou(mockMovies.slice(2, 5));
      } finally {
        if (!cancelled) setLoading((l) => ({ ...l, forYou: false }));
      }
    };
    
    const fetchFeed = async () => {
      try {
        const { data } = await axios.get('/api/discovery/feed');
        if (!cancelled && data.success) setFeed(data.movies || []);
      } catch (error) {
        // Use mock data when API fails
        if (!cancelled) setFeed(mockMovies.slice(1, 4));
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
      } catch (error) {
        // Use mock data when API fails
        if (!cancelled) setAiRecommendations(mockMovies.slice(0, 3));
      } finally {
        if (!cancelled) setLoading((l) => ({ ...l, aiRecommendations: false }));
      }
    };

    const fetchSimilarMovies = async () => {
      try {
        const { data } = await axios.get('/api/discovery/similar');
        if (!cancelled && data.success) setSimilarMovies(data.movies || []);
      } catch (error) {
        // Use mock data when API fails
        if (!cancelled) setSimilarMovies(mockMovies.slice(3, 6));
      } finally {
        if (!cancelled) setLoading((l) => ({ ...l, similarMovies: false }));
      }
    };

    const fetchNewReleases = async () => {
      try {
        const { data } = await axios.get('/api/discovery/new-releases');
        if (!cancelled && data.success) setNewReleases(data.movies || []);
      } catch (error) {
        // Use mock data when API fails
        if (!cancelled) setNewReleases(mockMovies.slice(1, 5));
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
