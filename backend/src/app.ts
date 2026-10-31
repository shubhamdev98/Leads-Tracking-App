import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import apiRoutes from './routes/apiRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { config } from './config';

export function createApp(): Application {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logging
  if (!config.isTest) {
    app.use(morgan('dev'));
  }

  // API Root information
  app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
      name: 'Lead Management API',
      version: '1.0.0',
      status: 'active',
      endpoints: {
        leads: '/api/leads',
        lead_by_id: '/api/leads/:id',
        notes: '/api/leads/:id/notes',
        stats: '/api/leads/stats',
      },
    });
  });

  // Mount REST API Routes
  app.use('/api', apiRoutes);

  // 404 handler
  app.use(notFoundHandler);

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}

export const app = createApp();
