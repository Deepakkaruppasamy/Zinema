import express from 'express';
import cors from 'cors';

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Debug route
app.get('/', (req, res) => {
    res.json({ 
        message: 'Debug API is working!', 
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.path,
        headers: req.headers,
        query: req.query
    });
});

// Test route
app.get('/test', (req, res) => {
    res.json({ 
        message: 'Debug test endpoint working!', 
        timestamp: new Date().toISOString()
    });
});

export default app;
