import Review from "../models/Review.js";

// GET /api/review/:movieId - list reviews for a movie (newest first)
export const listReviews = async (req, res) => {
  try {
    const { movieId } = req.params;
    const reviews = await Review.find({ $or: [{ movie: movieId }, { movieId }] })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, reviews });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: err.message });
  }
};

// POST /api/review - create or upsert current user's review
export const createReview = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { movieId, text, rating } = req.body;
    if (!movieId || !text || !rating) {
      return res.json({ success: false, message: "movieId, text and rating are required" });
    }
    // Match existing docs stored with either `movie` or legacy `movieId`, then set both
    const filter = { user: userId, $or: [{ movie: movieId }, { movieId }] };
    const update = { movie: movieId, movieId, user: userId, text: String(text).trim(), rating: Number(rating) };
    const doc = await Review.findOneAndUpdate(filter, update, { new: true, upsert: true, setDefaultsOnInsert: true });
    res.json({ success: true, review: doc });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: err.message });
  }
};

// PUT /api/review/:id - update own review
export const updateReview = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.params;
    const { text, rating } = req.body;
    const review = await Review.findById(id);
    if (!review) return res.json({ success: false, message: "Review not found" });
    if (review.user !== userId) return res.json({ success: false, message: "Not authorized" });
    review.text = String(text ?? review.text).trim();
    review.rating = Number(rating ?? review.rating);
    await review.save();
    res.json({ success: true, review });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: err.message });
  }
};

// DELETE /api/review/:id - delete own review
export const deleteReview = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.params;
    const review = await Review.findById(id);
    if (!review) return res.json({ success: false, message: "Review not found" });
    if (review.user !== userId) return res.json({ success: false, message: "Not authorized" });
    await review.deleteOne();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: err.message });
  }
};
