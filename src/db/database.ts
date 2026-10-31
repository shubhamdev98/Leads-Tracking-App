import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { config } from '../config';

let dbInstance: Database.Database | null = null;

export function getDatabase(customPath?: string): Database.Database {
  if (dbInstance) {
    return dbInstance;
  }

  const dbPath = customPath || config.databasePath;

  if (dbPath !== ':memory:') {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  dbInstance = new Database(dbPath);

  // Enable foreign key constraints
  dbInstance.pragma('foreign_keys = ON');

  // WAL journal mode for performance and concurrency
  if (dbPath !== ':memory:') {
    dbInstance.pragma('journal_mode = WAL');
  }

  initSchema(dbInstance);

  return dbInstance;
}

export function initSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('new', 'contacted', 'qualified', 'lost')),
      createdAt TEXT NOT NULL,
      updatedAt TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
    CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
    CREATE INDEX IF NOT EXISTS idx_leads_createdAt ON leads(createdAt DESC);

    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      leadId TEXT NOT NULL,
      content TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (leadId) REFERENCES leads(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_notes_leadId ON notes(leadId);
    CREATE INDEX IF NOT EXISTS idx_notes_createdAt ON notes(createdAt DESC);
  `);
}

export function resetDatabase(db?: Database.Database): void {
  const currentDb = db || dbInstance;
  if (!currentDb) return;

  currentDb.exec(`
    DELETE FROM notes;
    DELETE FROM leads;
  `);
}

export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
