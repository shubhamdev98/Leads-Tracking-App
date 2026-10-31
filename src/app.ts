import express, { Application } from 'express';
import path from 'path';
import cors from 'cors';
import morgan from 'morgan';
import apiRoutes from './routes/apiRoutes';
import portalRoutes from './routes/portalRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { config } from './config';

export function createApp(): Application {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Logging
  if (!config.isTest) {
    app.use(morgan('dev'));
  }

  // View Engine Configuration
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));

  // Static Assets
  app.use(express.static(path.join(__dirname, 'public')));

  // Web Portal Routes (Server-rendered HTML)
  app.use('/', portalRoutes);

  // REST API Routes
  app.use('/api', apiRoutes);

  // 404 Not Found Handler
  app.use(notFoundHandler);

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}

export const app = createApp();
