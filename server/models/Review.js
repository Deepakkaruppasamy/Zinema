import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    movie: { type: String, ref: "Movie", required: true },
    movieId: { type: String },
    user: { type: String, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    
    aiAnalysis: {
      sentimentScore: { type: Number, min: -1, max: 1 },
      confidenceScore: { type: Number, min: 0, max: 1 },
      emotions: [{ 
        emotion: String,
        intensity: { type: Number, min: 0, max: 1 }
      }],
      themes: [String],
      qualityFlags: {
        isSpam: { type: Boolean, default: false },
        isFake: { type: Boolean, default: false },
        isHelpful: { type: Boolean, default: true },
        toxicityScore: { type: Number, min: 0, max: 1, default: 0 }
      },
      language: { type: String, default: 'en' },
      readabilityScore: { type: Number, min: 0, max: 100 },
      helpfulnessScore: { type: Number, min: 0, max: 1 }
    },
    
    helpfulVotes: { type: Number, default: 0 },
    unhelpfulVotes: { type: Number, default: 0 },
    reportCount: { type: Number, default: 0 },
    
    moderationStatus: { 
      type: String, 
      enum: ['pending', 'approved', 'flagged', 'hidden'], 
      default: 'pending' 
    },
    moderatedBy: { type: String, ref: "User" },
    moderationReason: String
  },
  { timestamps: true }
);

reviewSchema.index({ movie: 1, user: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);
export default Review;
