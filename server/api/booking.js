import express from 'express';
import cors from 'cors';
import bookingRouter from '../routes/bookingRoutes.js';

const app = express();

app.use(express.json());
app.use(cors());

app.use('/', bookingRouter);

export default app;
