import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import path from 'path';
import fs from 'fs';
import { config } from '../config';

export interface ISqliteStatement {
  run(...params: any[]): { changes: number; lastInsertRowid: number };
  get(...params: any[]): any;
  all(...params: any[]): any[];
}

export interface ISqliteDatabase {
  prepare(sql: string): ISqliteStatement;
  exec(sql: string): void;
  pragma(pragmaStr: string): void;
  close(): void;
}

let sqlEngine: any = null;
let globalDbInstance: ISqliteDatabase | null = null;

export async function initDatabaseEngine(): Promise<any> {
  if (!sqlEngine) {
    sqlEngine = await initSqlJs();
  }
  return sqlEngine;
}

export function createSqliteDatabase(dbPath?: string): ISqliteDatabase {
  if (!sqlEngine) {
    throw new Error('Database engine not initialized. Please call await initDatabaseEngine() before using the database.');
  }

  const targetPath = dbPath || config.databasePath;
  const isMemory = targetPath === ':memory:';

  let rawDb: SqlJsDatabase;
  if (!isMemory && fs.existsSync(targetPath)) {
    const fileBuffer = fs.readFileSync(targetPath);
    rawDb = new sqlEngine.Database(fileBuffer);
  } else {
    rawDb = new sqlEngine.Database();
  }

  const persist = () => {
    if (!isMemory) {
      const dir = path.dirname(targetPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const data = rawDb.export();
      fs.writeFileSync(targetPath, Buffer.from(data));
    }
  };

  const formatParams = (params: any[]): any => {
    if (params.length === 0) return [];
    if (params.length === 1 && params[0] && typeof params[0] === 'object' && !Array.isArray(params[0])) {
      const obj = params[0];
      const formatted: Record<string, any> = {};
      for (const [k, v] of Object.entries(obj)) {
        if (k.startsWith('@') || k.startsWith(':') || k.startsWith('$')) {
          formatted[k] = v;
        } else {
          formatted[`@${k}`] = v;
          formatted[`:${k}`] = v;
          formatted[`$${k}`] = v;
        }
      }
      return formatted;
    }
    return params;
  };

  const dbWrapper: ISqliteDatabase = {
    prepare(sql: string): ISqliteStatement {
      return {
        run(...params: any[]) {
          const formatted = formatParams(params);
          rawDb.run(sql, formatted);
          const changes = rawDb.getRowsModified();
          persist();
          return { changes, lastInsertRowid: 0 };
        },
        get(...params: any[]) {
          const formatted = formatParams(params);
          const stmt = rawDb.prepare(sql);
          stmt.bind(formatted);
          let result = undefined;
          if (stmt.step()) {
            result = stmt.getAsObject();
          }
          stmt.free();
          return result;
        },
        all(...params: any[]) {
          const formatted = formatParams(params);
          const stmt = rawDb.prepare(sql);
          stmt.bind(formatted);
          const results: any[] = [];
          while (stmt.step()) {
            results.push(stmt.getAsObject());
          }
          stmt.free();
          return results;
        },
      };
    },
    exec(sql: string): void {
      rawDb.run(sql);
      persist();
    },
    pragma(pragmaStr: string): void {
      rawDb.run(`PRAGMA ${pragmaStr};`);
    },
    close(): void {
      rawDb.close();
    },
  };

  // Enable foreign key constraints
  dbWrapper.pragma('foreign_keys = ON');

  // Initialize schema
  initSchema(dbWrapper);

  return dbWrapper;
}

export function getDatabase(customPath?: string): ISqliteDatabase {
  if (customPath && customPath === ':memory:') {
    return createSqliteDatabase(':memory:');
  }

  if (globalDbInstance) {
    return globalDbInstance;
  }

  globalDbInstance = createSqliteDatabase(customPath);
  return globalDbInstance;
}

export function initSchema(db: ISqliteDatabase): void {
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

export function resetDatabase(db?: ISqliteDatabase): void {
  const currentDb = db || globalDbInstance;
  if (!currentDb) return;

  currentDb.exec(`
    DELETE FROM notes;
    DELETE FROM leads;
  `);
}

export function closeDatabase(): void {
  if (globalDbInstance) {
    globalDbInstance.close();
    globalDbInstance = null;
  }
}
