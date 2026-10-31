import { app } from './app';
import { config } from './config';
import { getDatabase, closeDatabase } from './db/database';

function startServer(): void {
  // Ensure database is initialized
  try {
    getDatabase();
    console.log(`[Database] SQLite connected at: ${config.databasePath}`);
  } catch (err) {
    console.error('[Database] Failed to connect to SQLite:', err);
    process.exit(1);
  }

  const server = app.listen(config.port, () => {
    console.log(`====================================================`);
    console.log(`  Lead Management Portal is running!`);
    console.log(`  - Web Portal:   http://localhost:${config.port}/leads`);
    console.log(`  - REST API:     http://localhost:${config.port}/api/leads`);
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
