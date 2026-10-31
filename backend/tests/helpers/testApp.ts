import express, { Application } from 'express';
import { createLeadApiController } from '../../src/controllers/leadApiController';
import { createNoteApiController } from '../../src/controllers/noteApiController';
import { errorHandler, notFoundHandler } from '../../src/middleware/errorHandler';
import { basicAuth } from '../../src/middleware/auth';
import { createTestContext } from './testDb';

export function createTestApp(authEnabled = false) {
  const context = createTestContext();
  const app: Application = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  if (authEnabled) {
    app.use(basicAuth);
  }

  const leadController = createLeadApiController(context.leadService);
  const noteController = createNoteApiController(context.noteService);

  // Leads
  app.get('/api/leads', leadController.getLeads);
  app.post('/api/leads', leadController.createLead);
  app.get('/api/leads/:id', leadController.getLeadById);
  app.patch('/api/leads/:id', leadController.updateLead);
  app.delete('/api/leads/:id', leadController.deleteLead);

  // Notes
  app.get('/api/leads/:id/notes', noteController.getNotes);
  app.post('/api/leads/:id/notes', noteController.addNote);
  app.delete('/api/leads/:id/notes/:noteId', noteController.deleteNote);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return {
    app,
    context,
  };
}
