import { app } from './app';
import { config } from './config';
import { getDatabase, closeDatabase } from './db/database';
import path from 'path';

async function startServer(): Promise<void> {
  // Ensure database is initialized
  try {
    getDatabase();
    console.log(`[Database] SQLite connected at: ${config.databasePath}`);
  } catch (err) {
    console.error('[Database] Failed to connect to SQLite:', err);
    process.exit(1);
  }

  // Attach Vite development middleware in development mode
  if (config.isDev) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { createServer: createViteServer } = (require as any)('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
        root: path.join(process.cwd(), 'client'),
      });
      app.use(vite.middlewares);
      console.log('[Vite] Development middleware attached to Express');
    } catch (viteErr) {
      console.warn('[Vite] Could not load Vite dev middleware:', viteErr);
    }
  }

  const server = app.listen(config.port, () => {
    console.log(`====================================================`);
    console.log(`  Lead Management Portal (React + Express) is running!`);
    console.log(`  - React Web Portal: http://localhost:${config.port}/`);
    console.log(`  - REST API:         http://localhost:${config.port}/api/leads`);
    console.log(`  - Environment:      ${config.nodeEnv}`);
    console.log(`  - Basic Auth:       ${config.auth.enabled ? 'ENABLED' : 'DISABLED (default)'}`);
    console.log(`====================================================`);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log('\nShutting down gracefully...');
    server.close(() => {
      closeDatabase();
      console.log('Server closed and database disconnected.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startServer();
