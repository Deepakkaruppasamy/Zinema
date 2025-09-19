import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    // Primary reference to Movie by string ID
    movie: { type: String, ref: "Movie", required: true },
    // Legacy support: some deployments have a unique index on (movieId, user)
    // Keep this field in sync to avoid duplicate key errors while migrating
    movieId: { type: String },
    user: { type: String, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: true }
);

reviewSchema.index({ movie: 1, user: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);
export default Review;
