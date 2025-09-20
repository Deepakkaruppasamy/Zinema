import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import path from 'path';
import fs from 'fs';
import connectDB from './configs/db.js';
import { clerkMiddleware } from '@clerk/express';
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";
import showRouter from './routes/showRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import userRouter from './routes/userRoutes.js';
import reviewRouter from './routes/reviewRoutes.js';
import discoveryRouter from './routes/discoveryRoutes.js';
import paymentLinkRouter from './routes/paymentLinkRoutes.js';
import supportRouter from './routes/supportRoutes.js';
import waitlistRouter from './routes/waitlistRoutes.js';
import { stripeWebhooks } from './controllers/stripeWebhooks.js';
import notificationsRouter from './routes/notificationsRoutes.js';
import pollRouter from './routes/pollRoutes.js';

const app = express();
const port = process.env.PORT || 5000;
const __dirname = path.resolve();

await connectDB()

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}

// Middleware
app.use(express.json())
app.use(cors())
app.use(clerkMiddleware())

// Serve static files from public directory
app.use(express.static(publicDir));

// Favicon handler
app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'favicon.ico'));
});

// API Routes
app.get('/', (req, res) => res.send('Server is Live!'))
app.use('/api/inngest', serve({ client: inngest, functions }))
app.use('/api/show', showRouter)
app.use('/api/booking', bookingRouter)
app.use('/api/booking-link', paymentLinkRouter)
app.use('/api/admin', adminRouter)
app.use('/api/user', userRouter)
app.use('/api/review', reviewRouter)
app.use('/api/discovery', discoveryRouter)
app.use('/api/support', supportRouter)
app.use('/api/waitlist', waitlistRouter)
app.use('/api/notify', notificationsRouter);
app.use('/api/poll', pollRouter);

// Catch-all handler for undefined routes
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.originalUrl}`,
        availableRoutes: [
            'GET /',
            'GET /api/show/*',
            'GET /api/booking/*',
            'GET /api/admin/*',
            'GET /api/user/*',
            'GET /api/review/*',
            'GET /api/discovery/*',
            'GET /api/support/*',
            'GET /api/waitlist/*',
            'GET /api/notify/*',
            'GET /api/poll/*',
            'GET /api/inngest/*'
        ]
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

// Start the server
const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    server.close(() => {
        process.exit(1);
    });
});

export default app;
