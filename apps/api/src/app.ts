import express from 'express';
import { router } from './routes';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { requestLogger } from './middleware/requestLogger';

export function createApp() {
  const app = express();
  app.use(express.json());
  app.use(requestLogger);
  app.use('/api', router);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}

export const app = createApp();
