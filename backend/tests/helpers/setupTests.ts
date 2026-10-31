import { initDatabaseEngine } from '../../src/db/database';

beforeAll(async () => {
  await initDatabaseEngine();
});
