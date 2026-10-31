import express, { Application } from 'express';
import path from 'path';
import fs from 'fs';
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

  // Mount REST API Routes
  app.use('/api', apiRoutes);

  // Serve compiled React client in production if available
  const clientDist = path.join(process.cwd(), 'dist', 'client');
  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.use((req, res, next) => {
      if (req.originalUrl.startsWith('/api') || req.method !== 'GET') {
        return next();
      }
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }

  // 404 handler for API routes
  app.use('/api', notFoundHandler);

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}

export const app = createApp();
