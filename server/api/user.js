import express from 'express';
import cors from 'cors';
import userRouter from '../routes/userRoutes.js';

const app = express();

app.use(express.json());
app.use(cors());

app.use('/', userRouter);

export default app;
