import express from "express";
import { listReviews, createReview, updateReview, deleteReview } from "../controllers/reviewController.js";

const reviewRouter = express.Router();

// Public: list reviews for a movie
reviewRouter.get("/:movieId", listReviews);

// Auth-required endpoints (req.auth provided by clerkMiddleware in server.js)
reviewRouter.post("/", createReview);
reviewRouter.put("/:id", updateReview);
reviewRouter.delete("/:id", deleteReview);

export default reviewRouter;
