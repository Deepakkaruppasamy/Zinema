import express from 'express';
import cors from 'cors';
import showRouter from '../routes/showRoutes.js';

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Debug middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - Show API`);
    next();
});

// Use the show router
app.use('/', showRouter);

// Fallback route
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'Route not found in show API',
        method: req.method,
        path: req.path,
        availableRoutes: [
            'GET / - Show API info',
            'GET /all - Get all shows',
            'GET /now-playing - Get now playing (Admin)',
            'POST /add - Add show (Admin)',
            'GET /:movieId - Get show by movie ID'
        ]
    });
});

export default app;
