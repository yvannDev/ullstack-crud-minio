import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import productsRouter from './routes/products.routes';
import { errorHandler } from './middlewares/error';
import { env } from './config/env';

export const app = express();
app.use(helmet());
app.use(cors({ origin: env.FRONTEND_ORIGIN }));
app.use(express.json());
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/products', productsRouter);
app.use(errorHandler);
