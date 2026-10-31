import { ISqliteDatabase, getDatabase } from '../db/database';
import { Note } from '../types/lead';

export function createNoteRecord(note: Note, customDb?: ISqliteDatabase): Note {
  const db = customDb || getDatabase();
  const stmt = db.prepare(`
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

export function findNotesByLeadId(leadId: string, customDb?: ISqliteDatabase): Note[] {
  const db = customDb || getDatabase();
  const stmt = db.prepare(`
    SELECT * FROM notes
    WHERE leadId = ?
    ORDER BY createdAt DESC
  `);
  return stmt.all(leadId) as Note[];
}

export function findNoteById(id: string, customDb?: ISqliteDatabase): Note | null {
  const db = customDb || getDatabase();
  const stmt = db.prepare('SELECT * FROM notes WHERE id = ?');
  const row = stmt.get(id) as Note | undefined;
  return row || null;
}

export function deleteNoteRecord(id: string, customDb?: ISqliteDatabase): boolean {
  const db = customDb || getDatabase();
  const stmt = db.prepare('DELETE FROM notes WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

export function deleteNotesByLeadId(leadId: string, customDb?: ISqliteDatabase): number {
  const db = customDb || getDatabase();
  const stmt = db.prepare('DELETE FROM notes WHERE leadId = ?');
  const result = stmt.run(leadId);
  return result.changes;
}

export function countNotes(customDb?: ISqliteDatabase): number {
  const db = customDb || getDatabase();
  const row = db.prepare('SELECT COUNT(*) as total FROM notes').get() as { total: number };
  return row ? row.total : 0;
}

export function createNoteRepository(db?: ISqliteDatabase) {
  return {
    create: (note: Note) => createNoteRecord(note, db),
    findByLeadId: (leadId: string) => findNotesByLeadId(leadId, db),
    findById: (id: string) => findNoteById(id, db),
    delete: (id: string) => deleteNoteRecord(id, db),
    deleteByLeadId: (leadId: string) => deleteNotesByLeadId(leadId, db),
    count: () => countNotes(db),
  };
}

export const noteRepository = createNoteRepository();
export const NoteRepository = createNoteRepository as any;
