import express from 'express';
import cors from 'cors';
import showRouter from '../routes/showRoutes.js';

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Use the show router
app.use('/', showRouter);

export default app;
