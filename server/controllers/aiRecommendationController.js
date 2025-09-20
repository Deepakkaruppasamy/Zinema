import Movie from '../models/Movie.js';
import Show from '../models/Show.js';
import UserPreferences from '../models/UserPreferences.js';
import Booking from '../models/Booking.js';
import Wishlist from '../models/Wishlist.js';

// Get AI-powered recommendations
export const getAIRecommendations = async (req, res) => {
  try {
    const { userId } = req.user;
    
    // Get user preferences
    const preferences = await UserPreferences.findOne({ userId });
    
    // Get user's booking history
    const userBookings = await Booking.find({ userId, isPaid: true })
      .populate('show')
      .sort({ createdAt: -1 })
      .limit(50);
    
    // Get user's wishlist
    const userWishlist = await Wishlist.find({ userId });
    
    // Get all available movies
    const allMovies = await Movie.find({}).limit(100);
    
    // Calculate recommendations
    const recommendations = calculateRecommendations(
      allMovies,
      userBookings,
      userWishlist,
      preferences
    );
    
    res.json({
      success: true,
      movies: recommendations.slice(0, 20) // Return top 20 recommendations
    });
  } catch (error) {
    console.error('Error getting AI recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get AI recommendations'
    });
  }
};

// Get similar movies
export const getSimilarMovies = async (req, res) => {
  try {
    const { movieId } = req.params;
    
    const targetMovie = await Movie.findById(movieId);
    if (!targetMovie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }
    
    const allMovies = await Movie.find({ _id: { $ne: movieId } }).limit(100);
    
    const similarMovies = calculateSimilarMovies(targetMovie, allMovies);
    
    res.json({
      success: true,
      movies: similarMovies.slice(0, 10)
    });
  } catch (error) {
    console.error('Error getting similar movies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get similar movies'
    });
  }
};

// Get trending movies
export const getTrendingMovies = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    // Get movies with most bookings in the last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const trendingData = await Booking.aggregate([
      {
        $match: {
          isPaid: true,
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $lookup: {
          from: 'shows',
          localField: 'showId',
          foreignField: '_id',
          as: 'show'
        }
      },
      { $unwind: '$show' },
      {
        $lookup: {
          from: 'movies',
          localField: 'show.movieId',
          foreignField: '_id',
          as: 'movie'
        }
      },
      { $unwind: '$movie' },
      {
        $group: {
          _id: '$movie._id',
          movie: { $first: '$movie' },
          bookingCount: { $sum: 1 },
          totalRevenue: { $sum: '$amount' }
        }
      },
      { $sort: { bookingCount: -1 } },
      { $limit: parseInt(limit) }
    ]);
    
    const trendingMovies = trendingData.map(item => ({
      ...item.movie,
      bookingCount: item.bookingCount,
      totalRevenue: item.totalRevenue
    }));
    
    res.json({
      success: true,
      movies: trendingMovies
    });
  } catch (error) {
    console.error('Error getting trending movies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get trending movies'
    });
  }
};

// Get new releases
export const getNewReleases = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const newReleases = await Movie.find({
      releaseDate: { $gte: thirtyDaysAgo }
    })
    .sort({ releaseDate: -1 })
    .limit(parseInt(limit));
    
    res.json({
      success: true,
      movies: newReleases
    });
  } catch (error) {
    console.error('Error getting new releases:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get new releases'
    });
  }
};

// Calculate AI recommendations
const calculateRecommendations = (allMovies, userBookings, userWishlist, preferences) => {
  const movieScores = new Map();
  
  // Get user's genre preferences from booking history
  const genrePreferences = getUserGenrePreferences(userBookings);
  
  // Get user's rating preferences
  const ratingPreferences = getUserRatingPreferences(userBookings);
  
  // Get user's year preferences
  const yearPreferences = getUserYearPreferences(userBookings);
  
  allMovies.forEach(movie => {
    let score = 0;
    
    // Genre matching (40% weight)
    if (movie.genres && Array.isArray(movie.genres)) {
      const genreMatch = movie.genres.some(genre => 
        genrePreferences.has(genre.name || genre)
      );
      if (genreMatch) score += 40;
    }
    
    // Rating matching (20% weight)
    if (movie.vote_average) {
      const ratingDiff = Math.abs(movie.vote_average - ratingPreferences.average);
      score += Math.max(0, 20 - (ratingDiff * 2));
    }
    
    // Year matching (15% weight)
    if (movie.release_date) {
      const movieYear = new Date(movie.release_date).getFullYear();
      const yearDiff = Math.abs(movieYear - yearPreferences.average);
      score += Math.max(0, 15 - (yearDiff / 2));
    }
    
    // Popularity boost (10% weight)
    if (movie.popularity) {
      score += Math.min(10, movie.popularity / 10);
    }
    
    // Wishlist boost (10% weight)
    const inWishlist = userWishlist.some(item => item.movieId === movie._id.toString());
    if (inWishlist) score += 10;
    
    // Recency boost (5% weight)
    if (movie.release_date) {
      const releaseDate = new Date(movie.release_date);
      const daysSinceRelease = (Date.now() - releaseDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceRelease < 30) score += 5;
    }
    
    movieScores.set(movie._id.toString(), {
      ...movie.toObject(),
      aiScore: score
    });
  });
  
  // Sort by score and return
  return Array.from(movieScores.values())
    .sort((a, b) => b.aiScore - a.aiScore);
};

// Calculate similar movies
const calculateSimilarMovies = (targetMovie, allMovies) => {
  const similarMovies = allMovies.map(movie => {
    let similarity = 0;
    
    // Genre similarity (50% weight)
    if (targetMovie.genres && movie.genres) {
      const targetGenres = targetMovie.genres.map(g => g.name || g);
      const movieGenres = movie.genres.map(g => g.name || g);
      const commonGenres = targetGenres.filter(genre => movieGenres.includes(genre));
      similarity += (commonGenres.length / Math.max(targetGenres.length, movieGenres.length)) * 50;
    }
    
    // Rating similarity (30% weight)
    if (targetMovie.vote_average && movie.vote_average) {
      const ratingDiff = Math.abs(targetMovie.vote_average - movie.vote_average);
      similarity += Math.max(0, 30 - (ratingDiff * 3));
    }
    
    // Year similarity (20% weight)
    if (targetMovie.release_date && movie.release_date) {
      const targetYear = new Date(targetMovie.release_date).getFullYear();
      const movieYear = new Date(movie.release_date).getFullYear();
      const yearDiff = Math.abs(targetYear - movieYear);
      similarity += Math.max(0, 20 - (yearDiff / 2));
    }
    
    return {
      ...movie.toObject(),
      similarity
    };
  });
  
  return similarMovies.sort((a, b) => b.similarity - a.similarity);
};

// Get user genre preferences from booking history
const getUserGenrePreferences = (userBookings) => {
  const genreCount = new Map();
  
  userBookings.forEach(booking => {
    if (booking.show && booking.show.movie && booking.show.movie.genres) {
      booking.show.movie.genres.forEach(genre => {
        const genreName = genre.name || genre;
        genreCount.set(genreName, (genreCount.get(genreName) || 0) + 1);
      });
    }
  });
  
  return genreCount;
};

// Get user rating preferences
const getUserRatingPreferences = (userBookings) => {
  const ratings = userBookings
    .filter(booking => booking.show && booking.show.movie && booking.show.movie.vote_average)
    .map(booking => booking.show.movie.vote_average);
  
  if (ratings.length === 0) return { average: 7, count: 0 };
  
  const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  return { average, count: ratings.length };
};

// Get user year preferences
const getUserYearPreferences = (userBookings) => {
  const years = userBookings
    .filter(booking => booking.show && booking.show.movie && booking.show.movie.release_date)
    .map(booking => new Date(booking.show.movie.release_date).getFullYear());
  
  if (years.length === 0) return { average: new Date().getFullYear() - 5, count: 0 };
  
  const average = years.reduce((sum, year) => sum + year, 0) / years.length;
  return { average, count: years.length };
};
