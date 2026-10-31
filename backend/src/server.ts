import { app } from './app';
import { config } from './config';
import { initDatabaseEngine, getDatabase, closeDatabase } from './db/database';

async function startServer(): Promise<void> {
  try {
    await initDatabaseEngine();
    getDatabase();
  } catch (err) {
    console.error('[Database] Failed to connect to SQLite:', err);
    process.exit(1);
  }

  const server = app.listen(config.port, () => {
    console.log(`Leads Tracking App API running on port ${config.port} (${config.nodeEnv})`);
  });

  const shutdown = () => {
    server.close(() => {
      closeDatabase();
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startServer();
