import express from 'express';
import cors from 'cors';

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Test route
app.get('/', (req, res) => {
    res.json({ 
        message: 'Test API is working!', 
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url
    });
});

// Test show route
app.get('/show', (req, res) => {
    res.json({ 
        message: 'Show API test endpoint is working!', 
        timestamp: new Date().toISOString()
    });
});

export default app;
