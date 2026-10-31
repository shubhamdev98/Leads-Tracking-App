import { initDatabaseEngine, getDatabase, closeDatabase } from './database';
import { findAllLeads } from '../repositories/leadRepository';
import { findNotesByLeadId } from '../repositories/noteRepository';

async function viewDatabase(): Promise<void> {
  await initDatabaseEngine();
  const db = getDatabase();

  const { leads } = findAllLeads({ limit: 50 }, db);

  if (leads.length === 0) {
    console.log('The database is currently empty. Run "npm run seed" to insert sample data.');
  } else {
    console.table(
      leads.map((l) => ({
        ID: l.id.slice(0, 8) + '...',
        Name: l.name,
        Email: l.email,
        Phone: l.phone,
        Status: l.status.toUpperCase(),
        Created: new Date(l.createdAt).toLocaleDateString(),
      }))
    );

    const firstLead = leads[0];
    const notes = findNotesByLeadId(firstLead.id, db);
    if (notes.length > 0) {
      console.log(`Notes for "${firstLead.name}":`);
      console.table(
        notes.map((n) => ({
          ID: n.id.slice(0, 8) + '...',
          Content: n.content.length > 50 ? n.content.slice(0, 50) + '...' : n.content,
          Created: new Date(n.createdAt).toLocaleDateString(),
        }))
      );
    }
  }

  closeDatabase();
}

viewDatabase().catch((err) => {
  console.error('Error viewing database:', err);
  process.exit(1);
});
