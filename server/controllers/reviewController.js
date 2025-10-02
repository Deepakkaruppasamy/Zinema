import Review from "../models/Review.js";
import reviewIntelligenceService from "../services/reviewIntelligenceService.js";

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

// POST /api/review - create or upsert current user's review with AI analysis
export const createReview = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { movieId, text, rating } = req.body;
    if (!movieId || !text || !rating) {
      return res.json({ success: false, message: "movieId, text and rating are required" });
    }

    // Perform AI analysis on the review
    const aiAnalysis = await reviewIntelligenceService.analyzeReview(
      String(text).trim(), 
      Number(rating),
      { userId } // Pass user context for personalization
    );

    // Check for quality flags and auto-moderate if needed
    const moderationStatus = aiAnalysis.qualityFlags.isSpam || aiAnalysis.qualityFlags.isFake 
      ? 'flagged' 
      : aiAnalysis.qualityFlags.toxicityScore > 0.7 
      ? 'flagged' 
      : 'approved';

    // Match existing docs stored with either `movie` or legacy `movieId`, then set both
    const filter = { user: userId, $or: [{ movie: movieId }, { movieId }] };
    const update = { 
      movie: movieId, 
      movieId, 
      user: userId, 
      text: String(text).trim(), 
      rating: Number(rating),
      aiAnalysis,
      moderationStatus,
      moderationReason: moderationStatus === 'flagged' 
        ? `Auto-flagged: ${aiAnalysis.qualityFlags.isSpam ? 'Spam' : aiAnalysis.qualityFlags.isFake ? 'Fake' : 'High toxicity'}`
        : undefined
    };

    const doc = await Review.findOneAndUpdate(filter, update, { new: true, upsert: true, setDefaultsOnInsert: true });
    
    // Don't return sensitive AI analysis data to client, just the review
    const clientReview = {
      ...doc.toObject(),
      aiAnalysis: {
        sentimentScore: doc.aiAnalysis?.sentimentScore,
        emotions: doc.aiAnalysis?.emotions,
        themes: doc.aiAnalysis?.themes,
        helpfulnessScore: doc.aiAnalysis?.helpfulnessScore
      }
    };

    res.json({ success: true, review: clientReview });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: err.message });
  }
};

// GET /api/review/:movieId/summary - get AI-powered personalized review summary
export const getReviewSummary = async (req, res) => {
  try {
    const { movieId } = req.params;
    const { userId } = req.auth ? req.auth() : { userId: null }; // Optional auth for personalization
    
    // Get approved reviews for the movie
    const reviews = await Review.find({ 
      $or: [{ movie: movieId }, { movieId }],
      moderationStatus: { $in: ['approved', 'pending'] }
    })
    .sort({ createdAt: -1 })
    .limit(50) // Limit for performance
    .lean();

    if (reviews.length === 0) {
      return res.json({ 
        success: true, 
        summary: {
          summary: "No reviews available for this movie yet.",
          highlights: [],
          concerns: [],
          recommendation: "neutral",
          confidenceScore: 0,
          personalizedInsights: []
        }
      });
    }

    // Get user preferences for personalization (if logged in)
    let userPreferences = {};
    if (userId) {
      // TODO: Fetch user preferences from database
      userPreferences = {
        favoriteGenres: ['action', 'drama'],
        importantAspects: ['plot', 'acting'],
        preferredRating: 4
      };
    }

    const summary = await reviewIntelligenceService.generatePersonalizedSummary(reviews, userPreferences);
    
    res.json({ success: true, summary });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: err.message });
  }
};

// POST /api/review/:id/helpful - mark review as helpful
export const markReviewHelpful = async (req, res) => {
  try {
    const { id } = req.params;
    const { helpful } = req.body; // true for helpful, false for unhelpful
    
    const update = helpful 
      ? { $inc: { helpfulVotes: 1 } }
      : { $inc: { unhelpfulVotes: 1 } };
    
    const review = await Review.findByIdAndUpdate(id, update, { new: true });
    
    if (!review) {
      return res.json({ success: false, message: "Review not found" });
    }
    
    res.json({ success: true, review });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: err.message });
  }
};

// POST /api/review/:id/report - report review for moderation
export const reportReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const review = await Review.findByIdAndUpdate(
      id, 
      { 
        $inc: { reportCount: 1 },
        moderationStatus: 'flagged',
        moderationReason: reason || 'User reported'
      }, 
      { new: true }
    );
    
    if (!review) {
      return res.json({ success: false, message: "Review not found" });
    }
    
    res.json({ success: true, message: "Review reported for moderation" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: err.message });
  }
};

// GET /api/review/analytics/:movieId - get review analytics for admins
export const getReviewAnalytics = async (req, res) => {
  try {
    const { movieId } = req.params;
    
    // Aggregate review analytics
    const analytics = await Review.aggregate([
      { $match: { $or: [{ movie: movieId }, { movieId }] } },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: "$rating" },
          averageSentiment: { $avg: "$aiAnalysis.sentimentScore" },
          spamCount: { $sum: { $cond: ["$aiAnalysis.qualityFlags.isSpam", 1, 0] } },
          fakeCount: { $sum: { $cond: ["$aiAnalysis.qualityFlags.isFake", 1, 0] } },
          flaggedCount: { $sum: { $cond: [{ $eq: ["$moderationStatus", "flagged"] }, 1, 0] } },
          averageHelpfulness: { $avg: "$aiAnalysis.helpfulnessScore" },
          totalHelpfulVotes: { $sum: "$helpfulVotes" },
          topEmotions: { $push: "$aiAnalysis.emotions" },
          topThemes: { $push: "$aiAnalysis.themes" }
        }
      }
    ]);

    // Process emotions and themes
    const result = analytics[0] || {};
    if (result.topEmotions) {
      const emotionCounts = {};
      result.topEmotions.flat().forEach(emotion => {
        if (emotion?.emotion) {
          emotionCounts[emotion.emotion] = (emotionCounts[emotion.emotion] || 0) + emotion.intensity;
        }
      });
      result.topEmotions = Object.entries(emotionCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([emotion, intensity]) => ({ emotion, intensity }));
    }

    if (result.topThemes) {
      const themeCounts = {};
      result.topThemes.flat().forEach(theme => {
        if (theme) {
          themeCounts[theme] = (themeCounts[theme] || 0) + 1;
        }
      });
      result.topThemes = Object.entries(themeCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([theme, count]) => ({ theme, count }));
    }

    res.json({ success: true, analytics: result });
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
