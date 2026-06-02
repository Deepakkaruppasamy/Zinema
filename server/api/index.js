import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from '../configs/db.js';
import { clerkMiddleware } from '@clerk/express';
import { serve } from "inngest/express";
import { inngest, functions } from "../inngest/index.js";
import { stripeWebhooks } from '../controllers/stripeWebhooks.js';

const app = express();

connectDB().catch(console.error);

app.use(express.json())
app.use(cors())
app.use(clerkMiddleware())

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

app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api/stripe', express.raw({type: 'application/json'}), stripeWebhooks)

app.use('/api/inngest', serve({ client: inngest, functions }))

export default app;
