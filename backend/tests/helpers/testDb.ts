import { createSqliteDatabase } from '../../src/db/database';
import { createLeadRepository } from '../../src/repositories/leadRepository';
import { createNoteRepository } from '../../src/repositories/noteRepository';
import { createLeadService } from '../../src/services/leadService';
import { createNoteService } from '../../src/services/noteService';

export function createTestContext() {
  const testDb = createSqliteDatabase(':memory:');

  const leadRepo = createLeadRepository(testDb);
  const noteRepo = createNoteRepository(testDb);
  const leadService = createLeadService(leadRepo, noteRepo);
  const noteService = createNoteService(noteRepo, leadRepo);

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
