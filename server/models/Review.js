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
    
    // AI-powered review intelligence fields
    aiAnalysis: {
      sentimentScore: { type: Number, min: -1, max: 1 }, // -1 (negative) to 1 (positive)
      confidenceScore: { type: Number, min: 0, max: 1 }, // 0 to 1 confidence in analysis
      emotions: [{ 
        emotion: String, // 'joy', 'anger', 'sadness', 'fear', 'surprise', 'disgust'
        intensity: { type: Number, min: 0, max: 1 }
      }],
      themes: [String], // ['acting', 'plot', 'visuals', 'soundtrack', 'directing']
      qualityFlags: {
        isSpam: { type: Boolean, default: false },
        isFake: { type: Boolean, default: false },
        isHelpful: { type: Boolean, default: true },
        toxicityScore: { type: Number, min: 0, max: 1, default: 0 }
      },
      language: { type: String, default: 'en' },
      readabilityScore: { type: Number, min: 0, max: 100 }, // Flesch reading ease
      helpfulnessScore: { type: Number, min: 0, max: 1 } // AI-predicted helpfulness
    },
    
    // User interaction metrics for quality assessment
    helpfulVotes: { type: Number, default: 0 },
    unhelpfulVotes: { type: Number, default: 0 },
    reportCount: { type: Number, default: 0 },
    
    // Admin moderation
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
