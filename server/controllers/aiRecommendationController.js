import Movie from '../models/Movie.js';
import Show from '../models/Show.js';
import UserPreferences from '../models/UserPreferences.js';
import Booking from '../models/Booking.js';
import Wishlist from '../models/Wishlist.js';
import Review from '../models/Review.js';
import Follow from '../models/Follow.js';

class DynamicRecommendationEngine {
  constructor() {
    this.weights = {
      genre: 0.3,
      rating: 0.25,
      recency: 0.2,
      popularity: 0.15,
      social: 0.1
    };
  }

  async getRecommendations(userId, limit = 20) {
    try {
      const [preferences, userBookings, userWishlist, userReviews, userFollows] = await Promise.all([
        UserPreferences.findOne({ userId }),
        Booking.find({ userId, isPaid: true }).populate('show').sort({ createdAt: -1 }).limit(50),
        Wishlist.find({ userId }),
        Review.find({ userId }).populate('movie'),
        Follow.find({ follower: userId })
      ]);

      const allMovies = await Movie.find({}).limit(200);
      const availableShows = await Show.find({ 
        showDateTime: { $gte: new Date() } 
      }).populate('movie');

      const userProfile = this.createUserProfile(userBookings, userReviews, preferences);
      
      const recommendations = await this.calculateDynamicRecommendations(
        allMovies,
        availableShows,
        userProfile,
        userFollows
      );

      return recommendations.slice(0, limit);
    } catch (error) {
      console.error('Error in dynamic recommendations:', error);
      throw error;
    }
  }

  createUserProfile(bookings, reviews, preferences) {
    const profile = {
      favoriteGenres: {},
      favoriteActors: {},
      favoriteDirectors: {},
      ratingPattern: {},
      timePreferences: {},
      priceRange: { min: 0, max: 1000 },
      totalBookings: bookings.length
    };

    bookings.forEach(booking => {
      const movie = booking.show.movie;
      const showTime = new Date(booking.show.showDateTime);
      
      movie.genres?.forEach(genre => {
        profile.favoriteGenres[genre.name] = (profile.favoriteGenres[genre.name] || 0) + 1;
      });

      const hour = showTime.getHours();
      const timeSlot = this.getTimeSlot(hour);
      profile.timePreferences[timeSlot] = (profile.timePreferences[timeSlot] || 0) + 1;

      profile.priceRange.min = Math.min(profile.priceRange.min, booking.show.showPrice);
      profile.priceRange.max = Math.max(profile.priceRange.max, booking.show.showPrice);
    });

    reviews.forEach(review => {
      const movie = review.movie;
      profile.ratingPattern[movie.vote_average] = (profile.ratingPattern[movie.vote_average] || 0) + 1;
    });

    profile.favoriteGenres = this.normalizePreferences(profile.favoriteGenres);
    profile.timePreferences = this.normalizePreferences(profile.timePreferences);

    return profile;
  }

  async calculateDynamicRecommendations(movies, shows, userProfile, userFollows) {
    const recommendations = [];

    for (const movie of movies) {
      const movieShows = shows.filter(show => show.movie._id.toString() === movie._id.toString());
      
      if (movieShows.length === 0) continue;

      const score = await this.calculateDynamicScore(movie, movieShows, userProfile, userFollows);
      
      recommendations.push({
        movie,
        shows: movieShows,
        score,
        reasons: this.generateRecommendationReasons(movie, userProfile, score)
      });
    }

    return recommendations.sort((a, b) => b.score - a.score);
  }

  async calculateDynamicScore(movie, movieShows, userProfile, userFollows) {
    let score = 0;

    const genreScore = this.calculateGenreScore(movie, userProfile);
    score += genreScore * this.weights.genre;

    const ratingScore = this.calculateRatingScore(movie, userProfile);
    score += ratingScore * this.weights.rating;

    const recencyScore = this.calculateRecencyScore(movie);
    score += recencyScore * this.weights.recency;

    const popularityScore = await this.calculatePopularityScore(movie, movieShows);
    score += popularityScore * this.weights.popularity;

    const socialScore = await this.calculateSocialScore(movie, userFollows);
    score += socialScore * this.weights.social;

    return Math.round(score * 100) / 100;
  }

  calculateGenreScore(movie, userProfile) {
    if (!movie.genres || movie.genres.length === 0) return 0.5;
    
    let totalScore = 0;
    let genreCount = 0;

    movie.genres.forEach(genre => {
      const userPreference = userProfile.favoriteGenres[genre.name] || 0;
      totalScore += userPreference;
      genreCount++;
    });

    return genreCount > 0 ? totalScore / genreCount : 0.5;
  }

  calculateRatingScore(movie, userProfile) {
    const movieRating = movie.vote_average || 0;
    const userAvgRating = this.calculateUserAverageRating(userProfile);
    
    const ratingDiff = Math.abs(movieRating - userAvgRating);
    return Math.max(0, 1 - (ratingDiff / 5));
  }

  calculateRecencyScore(movie) {
    const releaseDate = new Date(movie.release_date);
    const now = new Date();
    const daysSinceRelease = (now - releaseDate) / (1000 * 60 * 60 * 24);
    
    if (daysSinceRelease <= 30) return 1.0;
    if (daysSinceRelease <= 90) return 0.8;
    if (daysSinceRelease <= 365) return 0.6;
    return 0.4;
  }

  async calculatePopularityScore(movie, movieShows) {
    let totalOccupancy = 0;
    let showCount = 0;

    for (const show of movieShows) {
      const totalSeats = 100;
      const occupiedSeats = Object.keys(show.occupiedSeats || {}).length;
      const occupancyRate = occupiedSeats / totalSeats;
      
      totalOccupancy += occupancyRate;
      showCount++;
    }

    return showCount > 0 ? totalOccupancy / showCount : 0.5;
  }

  async calculateSocialScore(movie, userFollows) {
    if (userFollows.length === 0) return 0.5;

    const friendIds = userFollows.map(follow => follow.following);
    
    const [friendBookings, friendReviews] = await Promise.all([
      Booking.find({ 
        userId: { $in: friendIds },
        isPaid: true 
      }).populate('show'),
      Review.find({ 
        userId: { $in: friendIds },
        movie: movie._id 
      })
    ]);

    let socialScore = 0;
    let totalFriends = friendIds.length;

    const friendsWhoBooked = new Set();
    friendBookings.forEach(booking => {
      if (booking.show.movie._id.toString() === movie._id.toString()) {
        friendsWhoBooked.add(booking.userId.toString());
      }
    });

    const positiveReviews = friendReviews.filter(review => review.rating >= 4);
    
    socialScore = (friendsWhoBooked.size + positiveReviews.length) / totalFriends;
    return Math.min(socialScore, 1.0);
  }

  generateRecommendationReasons(movie, userProfile, score) {
    const reasons = [];

    const topGenres = Object.entries(userProfile.favoriteGenres)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
    
    const movieGenres = movie.genres?.map(g => g.name) || [];
    const matchingGenres = topGenres.filter(([genre]) => movieGenres.includes(genre));
    
    if (matchingGenres.length > 0) {
      reasons.push(`Matches your favorite genres: ${matchingGenres.map(([g]) => g).join(', ')}`);
    }

    if (movie.vote_average >= 7.5) {
      reasons.push('Highly rated movie');
    }

    const releaseDate = new Date(movie.release_date);
    const daysSinceRelease = (Date.now() - releaseDate) / (1000 * 60 * 60 * 24);
    
    if (daysSinceRelease <= 30) {
      reasons.push('New release');
    }

    return reasons;
  }

  getTimeSlot(hour) {
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  }

  normalizePreferences(preferences) {
    const total = Object.values(preferences).reduce((sum, val) => sum + val, 0);
    if (total === 0) return {};
    
    const normalized = {};
    Object.entries(preferences).forEach(([key, value]) => {
      normalized[key] = value / total;
    });
    return normalized;
  }

  calculateUserAverageRating(userProfile) {
    const ratings = Object.keys(userProfile.ratingPattern);
    if (ratings.length === 0) return 6.0;
    
    const weightedSum = ratings.reduce((sum, rating) => {
      return sum + (parseFloat(rating) * userProfile.ratingPattern[rating]);
    }, 0);
    
    const totalCount = Object.values(userProfile.ratingPattern).reduce((sum, count) => sum + count, 0);
    return totalCount > 0 ? weightedSum / totalCount : 6.0;
  }
}

const recommendationEngine = new DynamicRecommendationEngine();

export const getAIRecommendations = async (req, res) => {
  try {
    const { userId } = req.user;
    
    const recommendations = await recommendationEngine.getRecommendations(userId, 20);
    
    res.json({
      success: true,
      movies: recommendations,
      algorithm: 'dynamic-ai-v2',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting AI recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get AI recommendations'
    });
  }
};

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

export const getTrendingMovies = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
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

const calculateRecommendations = (allMovies, userBookings, userWishlist, preferences) => {
  const movieScores = new Map();
  
  const genrePreferences = getUserGenrePreferences(userBookings);
  
  const ratingPreferences = getUserRatingPreferences(userBookings);
  
  const yearPreferences = getUserYearPreferences(userBookings);
  
  allMovies.forEach(movie => {
    let score = 0;
    
    if (movie.genres && Array.isArray(movie.genres)) {
      const genreMatch = movie.genres.some(genre => 
        genrePreferences.has(genre.name || genre)
      );
      if (genreMatch) score += 40;
    }
    
    if (movie.vote_average) {
      const ratingDiff = Math.abs(movie.vote_average - ratingPreferences.average);
      score += Math.max(0, 20 - (ratingDiff * 2));
    }
    
    if (movie.release_date) {
      const movieYear = new Date(movie.release_date).getFullYear();
      const yearDiff = Math.abs(movieYear - yearPreferences.average);
      score += Math.max(0, 15 - (yearDiff / 2));
    }
    
    if (movie.popularity) {
      score += Math.min(10, movie.popularity / 10);
    }
    
    const inWishlist = userWishlist.some(item => item.movieId === movie._id.toString());
    if (inWishlist) score += 10;
    
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
  
  return Array.from(movieScores.values())
    .sort((a, b) => b.aiScore - a.aiScore);
};

const calculateSimilarMovies = (targetMovie, allMovies) => {
  const similarMovies = allMovies.map(movie => {
    let similarity = 0;
    
    if (targetMovie.genres && movie.genres) {
      const targetGenres = targetMovie.genres.map(g => g.name || g);
      const movieGenres = movie.genres.map(g => g.name || g);
      const commonGenres = targetGenres.filter(genre => movieGenres.includes(genre));
      similarity += (commonGenres.length / Math.max(targetGenres.length, movieGenres.length)) * 50;
    }
    
    if (targetMovie.vote_average && movie.vote_average) {
      const ratingDiff = Math.abs(targetMovie.vote_average - movie.vote_average);
      similarity += Math.max(0, 30 - (ratingDiff * 3));
    }
    
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

const getUserRatingPreferences = (userBookings) => {
  const ratings = userBookings
    .filter(booking => booking.show && booking.show.movie && booking.show.movie.vote_average)
    .map(booking => booking.show.movie.vote_average);
  
  if (ratings.length === 0) return { average: 7, count: 0 };
  
  const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  return { average, count: ratings.length };
};

const getUserYearPreferences = (userBookings) => {
  const years = userBookings
    .filter(booking => booking.show && booking.show.movie && booking.show.movie.release_date)
    .map(booking => new Date(booking.show.movie.release_date).getFullYear());
  
  if (years.length === 0) return { average: new Date().getFullYear() - 5, count: 0 };
  
  const average = years.reduce((sum, year) => sum + year, 0) / years.length;
  return { average, count: years.length };
};
