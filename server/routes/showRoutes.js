import express from "express";
import { addShow, getNowPlayingMovies, getShow, getShows } from "../controllers/showController.js";

const showRouter = express.Router();

// Root route for show API
showRouter.get('/', (req, res) => {
    res.json({ 
        message: 'Show API is working!', 
        timestamp: new Date().toISOString(),
        availableEndpoints: [
            'GET /now-playing - Get now playing movies (Admin only)',
            'POST /add - Add new show (Admin only)',
            'GET /all - Get all shows',
            'GET /:movieId - Get show by movie ID'
        ]
    });
});

// Admin routes - auth disabled for testing
showRouter.get('/now-playing', getNowPlayingMovies)
showRouter.post('/add', addShow)

// Public routes (no auth required)
showRouter.get("/all", getShows)
showRouter.get("/:movieId", getShow)

export default showRouter;