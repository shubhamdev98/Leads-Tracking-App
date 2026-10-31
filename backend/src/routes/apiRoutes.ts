import { Router } from 'express';
import { LeadApiController } from '../controllers/leadApiController';
import { NoteApiController } from '../controllers/noteApiController';
import { basicAuth } from '../middleware/auth';

const router = Router();
const leadController = new LeadApiController();
const noteController = new NoteApiController();

// Apply optional Basic Authentication if enabled
router.use(basicAuth);

// Leads API Endpoints
router.get('/leads', leadController.getLeads);
router.get('/leads/stats', leadController.getStats);
router.post('/leads', leadController.createLead);
router.get('/leads/:id', leadController.getLeadById);
router.patch('/leads/:id', leadController.updateLead);
router.delete('/leads/:id', leadController.deleteLead);

// Notes API Endpoints
router.get('/leads/:id/notes', noteController.getNotes);
router.post('/leads/:id/notes', noteController.addNote);
router.delete('/leads/:id/notes/:noteId', noteController.deleteNote);

export default router;
