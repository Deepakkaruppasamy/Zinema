import { clerkClient } from "@clerk/express";
import Booking from "../models/Booking.js";
import Movie from "../models/Movie.js";
import Show from "../models/Show.js";
import Follow from "../models/Follow.js";
import Review from "../models/Review.js";
import TrendingConfig from "../models/TrendingConfig.js";

// GET /api/discovery/trending - movies by bookings in last 7 days
export const getTrending = async (req, res) => {
  try {
    // 1) Prefer admin-curated trending by SHOW IDs, then MOVIE IDs
    const curated = await TrendingConfig.findById("curated");
    const curatedShowIds = (curated?.showIds || []).map(String);
    if (curatedShowIds.length) {
      const shows = await Show.find({ _id: { $in: curatedShowIds } }).populate('movie');
      // keep order by showIds
      const order = new Map(curatedShowIds.map((id, idx) => [String(id), idx]));
      shows.sort((a, b) => (order.get(String(a._id)) ?? 0) - (order.get(String(b._id)) ?? 0));
      // map to movies, dedupe by movie id preserving order
      const seen = new Set();
      const movies = [];
      for (const s of shows) {
        if (s?.movie && !seen.has(String(s.movie._id))) {
          seen.add(String(s.movie._id));
          movies.push(s.movie);
        }
      }
      return res.json({ success: true, movies });
    }
    const curatedMovieIds = (curated?.movieIds || []).map(String);
    if (curatedMovieIds.length) {
      const movies = await Movie.find({ _id: { $in: curatedMovieIds } });
      const order = new Map(curatedMovieIds.map((id, idx) => [String(id), idx]));
      movies.sort((a, b) => (order.get(String(a._id)) ?? 0) - (order.get(String(b._id)) ?? 0));
      return res.json({ success: true, movies });
    }

    // 2) Fallback to bookings-based trending (last 7 days)
    const since = new Date();
    since.setDate(since.getDate() - 7);

    const agg = await Booking.aggregate([
      { $match: { isPaid: true, createdAt: { $gte: since } } },
      { $lookup: { from: "shows", localField: "show", foreignField: "_id", as: "showDoc" } },
      { $unwind: "$showDoc" },
      { $group: { _id: "$showDoc.movie", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);

    const movieIds = agg.map((a) => a._id);
    const movies = await Movie.find({ _id: { $in: movieIds } });
    const order = new Map(movieIds.map((id, idx) => [String(id), idx]));
    movies.sort((a, b) => (order.get(String(a._id)) ?? 0) - (order.get(String(b._id)) ?? 0));

    res.json({ success: true, movies });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
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
