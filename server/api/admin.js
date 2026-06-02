import express from 'express';
import cors from 'cors';
import adminRouter from '../routes/adminRoutes.js';

const app = express();

app.use(express.json());
app.use(cors());

app.use('/', adminRouter);

export default app;
