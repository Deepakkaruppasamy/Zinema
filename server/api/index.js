import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from '../configs/db.js';
import { clerkMiddleware } from '@clerk/express';
import { serve } from "inngest/express";
import { inngest, functions } from "../inngest/index.js";
import { stripeWebhooks } from '../controllers/stripeWebhooks.js';

const app = express();

// Connect to database
connectDB().catch(console.error);

// Middleware
app.use(express.json())
app.use(cors())
app.use(clerkMiddleware())

// Root route
app.get('/', (req, res) => {
    res.json({ 
        message: 'Zinema Backend API is Live!', 
        timestamp: new Date().toISOString(),
        endpoints: [
            'GET /api/show - Show management',
            'GET /api/booking - Booking management', 
            'GET /api/admin - Admin functions',
            'GET /api/user - User management',
            'POST /api/stripe - Stripe webhooks',
            'POST /api/inngest - Inngest functions'
        ]
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Stripe Webhooks Route
app.use('/api/stripe', express.raw({type: 'application/json'}), stripeWebhooks)

// Inngest functions
app.use('/api/inngest', serve({ client: inngest, functions }))

// Export the app for Vercel
export default app;
