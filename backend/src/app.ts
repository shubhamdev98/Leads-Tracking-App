import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import apiRoutes from './routes/apiRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { config } from './config';

export function createApp(): Application {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  if (!config.isTest) {
    app.use(morgan('dev'));
  }

  app.get('/api', (req: Request, res: Response) => {
    res.status(200).json({
      name: 'Leads Tracking App API',
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

  app.use('/api', apiRoutes);

  const frontendDist = path.resolve(__dirname, '../../frontend/dist');
  if (fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist));
    app.use((req: Request, res: Response, next) => {
      if (req.method === 'GET' && !req.path.startsWith('/api')) {
        const indexPath = path.join(frontendDist, 'index.html');
        if (fs.existsSync(indexPath)) {
          return res.sendFile(indexPath);
        }
      }
      next();
    });
  } else {
    app.get('/', (req: Request, res: Response) => {
      res.redirect('/api');
    });
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export const app = createApp();
