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

reviewRouter.get("/:movieId", listReviews);

reviewRouter.get("/:movieId/summary", getReviewSummary);

reviewRouter.post("/", createReview);
reviewRouter.put("/:id", updateReview);
reviewRouter.delete("/:id", deleteReview);

reviewRouter.post("/:id/helpful", markReviewHelpful);
reviewRouter.post("/:id/report", reportReview);

reviewRouter.get("/analytics/:movieId", getReviewAnalytics);

export default reviewRouter;
