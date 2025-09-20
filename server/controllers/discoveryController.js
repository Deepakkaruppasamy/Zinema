import { clerkClient } from "@clerk/express";
import Booking from "../models/Booking.js";
import Movie from "../models/Movie.js";
import Show from "../models/Show.js";
import Follow from "../models/Follow.js";
import Review from "../models/Review.js";
import TrendingConfig from "../models/TrendingConfig.js";

// Dynamic Trending Algorithm
class DynamicTrendingEngine {
  constructor() {
    this.weights = {
      recentBookings: 0.4,    // Last 24 hours
      weeklyBookings: 0.3,    // Last 7 days
      socialEngagement: 0.2,  // Reviews, wishlists
      velocity: 0.1           // Booking growth rate
    };
  }

  // Calculate dynamic trending scores
  async calculateTrendingScores() {
    try {
      const now = new Date();
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const last14Days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      // Get all movies with shows
      const movies = await Movie.find({});
      const trendingScores = [];

      for (const movie of movies) {
        const score = await this.calculateMovieTrendingScore(movie, {
          last24Hours,
          last7Days,
          last14Days
        });

        if (score.totalScore > 0) {
          trendingScores.push({
            movie,
            score: score.totalScore,
            breakdown: score.breakdown,
            trend: score.trend
          });
        }
      }

      // Sort by trending score
      return trendingScores.sort((a, b) => b.score - a.score);
    } catch (error) {
      console.error('Error calculating trending scores:', error);
      throw error;
    }
  }

  // Calculate trending score for a specific movie
  async calculateMovieTrendingScore(movie, timeRanges) {
    const { last24Hours, last7Days, last14Days } = timeRanges;

    // Get bookings for this movie
    const [recentBookings, weeklyBookings, biweeklyBookings] = await Promise.all([
      Booking.find({
        createdAt: { $gte: last24Hours },
        isPaid: true
      }).populate('show'),
      Booking.find({
        createdAt: { $gte: last7Days },
        isPaid: true
      }).populate('show'),
      Booking.find({
        createdAt: { $gte: last14Days },
        isPaid: true
      }).populate('show')
    ]);

    // Filter bookings for this movie
    const movieRecentBookings = recentBookings.filter(b => 
      b.show.movie._id.toString() === movie._id.toString()
    );
    const movieWeeklyBookings = weeklyBookings.filter(b => 
      b.show.movie._id.toString() === movie._id.toString()
    );
    const movieBiweeklyBookings = biweeklyBookings.filter(b => 
      b.show.movie._id.toString() === movie._id.toString()
    );

    // Calculate individual scores
    const recentScore = this.calculateRecentBookingScore(movieRecentBookings);
    const weeklyScore = this.calculateWeeklyBookingScore(movieWeeklyBookings);
    const socialScore = await this.calculateSocialEngagementScore(movie);
    const velocityScore = this.calculateVelocityScore(movieWeeklyBookings, movieBiweeklyBookings);

    // Calculate total score
    const totalScore = 
      recentScore * this.weights.recentBookings +
      weeklyScore * this.weights.weeklyBookings +
      socialScore * this.weights.socialEngagement +
      velocityScore * this.weights.velocity;

    // Determine trend direction
    const trend = this.determineTrend(movieRecentBookings, movieWeeklyBookings);

    return {
      totalScore,
      breakdown: {
        recent: recentScore,
        weekly: weeklyScore,
        social: socialScore,
        velocity: velocityScore
      },
      trend
    };
  }

  // Calculate recent booking score (last 24 hours)
  calculateRecentBookingScore(bookings) {
    const count = bookings.length;
    // Exponential scoring for recent activity
    return Math.min(count * 2, 10); // Cap at 10
  }

  // Calculate weekly booking score
  calculateWeeklyBookingScore(bookings) {
    const count = bookings.length;
    // Linear scoring for weekly activity
    return Math.min(count, 20); // Cap at 20
  }

  // Calculate social engagement score
  async calculateSocialEngagementScore(movie) {
    const [reviews, wishlists] = await Promise.all([
      Review.find({ movie: movie._id }).countDocuments(),
      Wishlist.find({ movie: movie._id }).countDocuments()
    ]);

    // Weighted social engagement
    const reviewScore = Math.min(reviews * 0.5, 5);
    const wishlistScore = Math.min(wishlists * 1, 10);
    
    return reviewScore + wishlistScore;
  }

  // Calculate velocity score (growth rate)
  calculateVelocityScore(weeklyBookings, biweeklyBookings) {
    const weeklyCount = weeklyBookings.length;
    const biweeklyCount = biweeklyBookings.length;
    const previousWeekCount = biweeklyCount - weeklyCount;

    if (previousWeekCount === 0) return weeklyCount > 0 ? 5 : 0;
    
    const growthRate = (weeklyCount - previousWeekCount) / previousWeekCount;
    return Math.max(0, growthRate * 10); // Cap at 10
  }

  // Determine trend direction
  determineTrend(recentBookings, weeklyBookings) {
    const recentCount = recentBookings.length;
    const weeklyCount = weeklyBookings.length;
    const avgDaily = weeklyCount / 7;

    if (recentCount > avgDaily * 1.5) return 'hot';
    if (recentCount > avgDaily) return 'rising';
    if (recentCount < avgDaily * 0.5) return 'cooling';
    return 'stable';
  }
}

// const trendingEngine = new DynamicTrendingEngine(); // Disabled for now

// GET /api/discovery/trending - Dynamic trending algorithm
export const getTrending = async (req, res) => {
  try {
    // 1) Check for admin-curated trending first
    const curated = await TrendingConfig.findById("curated");
    const curatedShowIds = (curated?.showIds || []).map(String);
    
    if (curatedShowIds.length) {
      const shows = await Show.find({ _id: { $in: curatedShowIds } }).populate('movie');
      const order = new Map(curatedShowIds.map((id, idx) => [String(id), idx]));
      shows.sort((a, b) => (order.get(String(a._id)) ?? 0) - (order.get(String(b._id)) ?? 0));
      
      const seen = new Set();
      const movies = [];
      for (const s of shows) {
        if (s?.movie && !seen.has(String(s.movie._id))) {
          seen.add(String(s.movie._id));
          movies.push(s.movie);
        }
      }
      return res.json({ 
        success: true, 
        movies,
        source: 'curated',
        algorithm: 'admin-curated'
      });
    }

    const curatedMovieIds = (curated?.movieIds || []).map(String);
    if (curatedMovieIds.length) {
      const movies = await Movie.find({ _id: { $in: curatedMovieIds } });
      const order = new Map(curatedMovieIds.map((id, idx) => [String(id), idx]));
      movies.sort((a, b) => (order.get(String(a._id)) ?? 0) - (order.get(String(b._id)) ?? 0));
      return res.json({ 
        success: true, 
        movies,
        source: 'curated',
        algorithm: 'admin-curated'
      });
    }

    // 2) Fallback to simple trending by rating
    const movies = await Movie.find({})
      .sort({ vote_average: -1, popularity: -1 })
      .limit(20);

    res.json({
      success: true,
      movies,
      source: 'fallback',
      algorithm: 'rating-based',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting trending movies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get trending movies'
    });
  }
};

// GET /api/discovery/feed - movies surfaced from people you follow
export const getFeed = async (req, res) => {
  try {
    const userId = req.auth()?.userId;
    if (!userId) return res.json({ success: false, message: "Not authenticated" });

    const since = new Date();
    since.setDate(since.getDate() - 30);

    const followingRows = await Follow.find({ follower: userId });
    const following = followingRows.map((r) => r.following);
    if (following.length === 0) return res.json({ success: true, movies: [] });

    // Recent reviews by followed users
    const recentReviews = await Review.find({ user: { $in: following }, createdAt: { $gte: since } })
      .sort({ createdAt: -1 })
      .limit(200);
    const reviewedMovieIds = recentReviews.map((r) => r.movie);

    // Recent bookings by followed users -> map to movie ids
    const recentBookings = await Booking.aggregate([
      { $match: { user: { $in: following }, isPaid: true, createdAt: { $gte: since } } },
      { $lookup: { from: "shows", localField: "show", foreignField: "_id", as: "showDoc" } },
      { $unwind: "$showDoc" },
      { $project: { movie: "$showDoc.movie" } },
    ]);
    const bookedMovieIds = recentBookings.map((b) => b.movie);

    const combined = Array.from(new Set([...
      reviewedMovieIds.map(String), ...bookedMovieIds.map(String)
    ]));

    if (combined.length === 0) return res.json({ success: true, movies: [] });

    const movies = await Movie.find({ _id: { $in: combined } }).limit(40);
    // Sort by simple heuristic: presence in reviews first (more signal)
    const score = new Map();
    reviewedMovieIds.forEach((id) => score.set(String(id), (score.get(String(id)) || 0) + 2));
    bookedMovieIds.forEach((id) => score.set(String(id), (score.get(String(id)) || 0) + 1));
    movies.sort((a, b) => (score.get(String(b._id)) || 0) - (score.get(String(a._id)) || 0));

    res.json({ success: true, movies });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// GET /api/discovery/for-you - personalized by favorite genres
export const getForYou = async (req, res) => {
  try {
    const userId = req.auth()?.userId;
    if (!userId) return res.json({ success: false, message: "Not authenticated" });

    const user = await clerkClient.users.getUser(userId);
    const favorites = (user.privateMetadata?.favorites || []);

    // Fetch favorite movies to derive genre set
    const favMovies = await Movie.find({ _id: { $in: favorites } });
    const favGenres = new Set();
    favMovies.forEach((m) => (m.genres || []).forEach((g) => favGenres.add(g)));

    if (favGenres.size === 0) {
      // fallback to top rated overall
      const fallback = await Movie.find({}).sort({ vote_average: -1 }).limit(20);
      return res.json({ success: true, movies: fallback });
    }

    const movies = await Movie.find({
      _id: { $nin: favorites },
      genres: { $in: Array.from(favGenres) },
    })
      .sort({ vote_average: -1 })
      .limit(40);

    res.json({ success: true, movies });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// GET /api/discovery/similar - similar movies based on genre
export const getSimilar = async (req, res) => {
  try {
    const { movieId } = req.query;
    
    if (!movieId) {
      return res.json({ success: false, message: 'Movie ID is required' });
    }

    // Find the movie to get its genres
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.json({ success: false, message: 'Movie not found' });
    }

    const movieGenres = movie.genres || [];
    const genreIds = movieGenres.map(genre => genre.id);

    // Find similar movies based on genre overlap
    const similarMovies = await Movie.find({
      _id: { $ne: movieId },
      'genres.id': { $in: genreIds }
    })
    .sort({ vote_average: -1 })
    .limit(20);

    res.json({ success: true, movies: similarMovies });
  } catch (error) {
    console.error('Error getting similar movies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get similar movies'
    });
  }
};

// GET /api/discovery/new-releases - recently released movies
export const getNewReleases = async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const newReleases = await Movie.find({
      release_date: { $gte: sixMonthsAgo.toISOString().split('T')[0] }
    })
    .sort({ release_date: -1, vote_average: -1 })
    .limit(20);

    res.json({ success: true, movies: newReleases });
  } catch (error) {
    console.error('Error getting new releases:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get new releases'
    });
  }
};

// GET /api/discovery/ai-recommendations - AI-powered recommendations
export const getAIRecommendations = async (req, res) => {
  try {
    const userId = req.auth()?.userId;
    
    if (!userId) {
      return res.json({ success: false, message: 'User not authenticated' });
    }

    // For now, return trending movies as AI recommendations
    // In a real implementation, this would use ML models
    const aiRecommendations = await Movie.find({})
      .sort({ vote_average: -1, popularity: -1 })
      .limit(10);

    res.json({ success: true, movies: aiRecommendations });
  } catch (error) {
    console.error('Error getting AI recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get AI recommendations'
    });
  }
};
