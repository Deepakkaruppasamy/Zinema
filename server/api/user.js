import express from 'express';
import cors from 'cors';
import userRouter from '../routes/userRoutes.js';

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Use the user router
app.use('/', userRouter);

export default app;
