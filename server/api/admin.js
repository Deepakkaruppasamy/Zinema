import express from 'express';
import cors from 'cors';
import adminRouter from '../routes/adminRoutes.js';

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Use the admin router
app.use('/', adminRouter);

export default app;
