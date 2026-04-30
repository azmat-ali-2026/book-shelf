import express, { Request, Response, NextFunction } from 'express';
import { router } from './routes';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { requestLogger } from './middleware/requestLogger';

const allowedOrigin = process.env['CORS_ORIGIN'] ?? 'http://localhost:3001';

const cors = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
};

export function createApp() {
  const app = express();
  app.use(cors);
  app.use(express.json());
  app.use(requestLogger);
  app.use('/api', router);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}

export const app = createApp();
