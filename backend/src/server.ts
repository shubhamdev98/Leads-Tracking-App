import { app } from './app';
import { config } from './config';
import { initDatabaseEngine, getDatabase, closeDatabase } from './db/database';

async function startServer(): Promise<void> {
  // Ensure database engine and connection are initialized
  try {
    await initDatabaseEngine();
    getDatabase();
    console.log(`[Database] SQLite connected at: ${config.databasePath}`);
  } catch (err) {
    console.error('[Database] Failed to connect to SQLite:', err);
    process.exit(1);
  }

  const server = app.listen(config.port, () => {
    console.log(`====================================================`);
    console.log(`  Lead Management API is running!`);
    console.log(`  - API Root:     http://localhost:${config.port}/`);
    console.log(`  - Leads API:    http://localhost:${config.port}/api/leads`);
    console.log(`  - Environment:  ${config.nodeEnv}`);
    console.log(`  - Basic Auth:   ${config.auth.enabled ? 'ENABLED' : 'DISABLED (default)'}`);
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
