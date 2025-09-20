import express from "express";
import { addShow, getNowPlayingMovies, getShow, getShows } from "../controllers/showController.js";
import { protectAdmin } from "../middleware/auth.js";

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

showRouter.get('/now-playing',protectAdmin, getNowPlayingMovies)
showRouter.post('/add', protectAdmin, addShow)
showRouter.get("/all", getShows)
showRouter.get("/:movieId", getShow)

export default showRouter;