import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  movieId: {
    type: String,
    required: true
  },
  movieTitle: {
    type: String,
    required: true
  },
  moviePoster: String,
  genre: String,
  rating: Number,
  addedAt: {
    type: Date,
    default: Date.now
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  notes: String,
  tags: [String]
}, {
  timestamps: true
});

// Compound index to ensure unique user-movie combinations
wishlistSchema.index({ userId: 1, movieId: 1 }, { unique: true });

export default mongoose.model('Wishlist', wishlistSchema);
