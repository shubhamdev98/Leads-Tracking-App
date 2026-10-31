import { ISqliteDatabase, getDatabase } from '../db/database';
import { Note } from '../types/lead';

export class NoteRepository {
  private _db?: ISqliteDatabase;

  constructor(private customDb?: ISqliteDatabase) {}

  private get db(): ISqliteDatabase {
    if (!this._db) {
      this._db = this.customDb || getDatabase();
    }
    return this._db;
  }

  create(note: Note): Note {
    const stmt = this.db.prepare(`
      INSERT INTO notes (id, leadId, content, createdAt)
      VALUES (@id, @leadId, @content, @createdAt)
    `);

    stmt.run({
      id: note.id,
      leadId: note.leadId,
      content: note.content,
      createdAt: note.createdAt,
    });

    return note;
  }

  findByLeadId(leadId: string): Note[] {
    const stmt = this.db.prepare(`
      SELECT * FROM notes
      WHERE leadId = ?
      ORDER BY createdAt DESC
    `);
    return stmt.all(leadId) as Note[];
  }

  findById(id: string): Note | null {
    const stmt = this.db.prepare('SELECT * FROM notes WHERE id = ?');
    const row = stmt.get(id) as Note | undefined;
    return row || null;
  }

  delete(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM notes WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  deleteByLeadId(leadId: string): number {
    const stmt = this.db.prepare('DELETE FROM notes WHERE leadId = ?');
    const result = stmt.run(leadId);
    return result.changes;
  }

  count(): number {
    const row = this.db.prepare('SELECT COUNT(*) as total FROM notes').get() as { total: number };
    return row ? row.total : 0;
  }
}
