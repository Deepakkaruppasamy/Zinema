import express from "express";
import { 
  listReviews, 
  createReview, 
  updateReview, 
  deleteReview,
  getReviewSummary,
  markReviewHelpful,
  reportReview,
  getReviewAnalytics
} from "../controllers/reviewController.js";

const reviewRouter = express.Router();

// Public: list reviews for a movie
reviewRouter.get("/:movieId", listReviews);

// Public: AI-powered review summary (personalized if authenticated)
reviewRouter.get("/:movieId/summary", getReviewSummary);

// Auth-required endpoints (req.auth provided by clerkMiddleware in server.js)
reviewRouter.post("/", createReview); // Enhanced with AI analysis
reviewRouter.put("/:id", updateReview);
reviewRouter.delete("/:id", deleteReview);

// Interactive review features
reviewRouter.post("/:id/helpful", markReviewHelpful); // Mark review as helpful/unhelpful
reviewRouter.post("/:id/report", reportReview); // Report review for moderation

// Admin/Analytics routes
reviewRouter.get("/analytics/:movieId", getReviewAnalytics); // AI analytics for admins

export default reviewRouter;
