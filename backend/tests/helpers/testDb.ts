import { createSqliteDatabase, ISqliteDatabase } from '../../src/db/database';
import { LeadRepository } from '../../src/repositories/leadRepository';
import { NoteRepository } from '../../src/repositories/noteRepository';
import { LeadService } from '../../src/services/leadService';
import { NoteService } from '../../src/services/noteService';

export function createTestContext() {
  const testDb = createSqliteDatabase(':memory:');

  const leadRepo = new LeadRepository(testDb);
  const noteRepo = new NoteRepository(testDb);
  const leadService = new LeadService(leadRepo, noteRepo);
  const noteService = new NoteService(noteRepo, leadRepo);

  return {
    db: testDb,
    leadRepo,
    noteRepo,
    leadService,
    noteService,
    cleanup: () => {
      testDb.close();
    },
  };
}
