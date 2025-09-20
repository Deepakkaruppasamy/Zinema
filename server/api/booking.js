import express from 'express';
import cors from 'cors';
import bookingRouter from '../routes/bookingRoutes.js';

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Use the booking router
app.use('/', bookingRouter);

export default app;
