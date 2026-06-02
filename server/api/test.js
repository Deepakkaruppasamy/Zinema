import express from 'express';
import cors from 'cors';

const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.json({ 
        message: 'Test API is working!', 
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url
    });
});

app.get('/show', (req, res) => {
    res.json({ 
        message: 'Show API test endpoint is working!', 
        timestamp: new Date().toISOString()
    });
});

export default app;
