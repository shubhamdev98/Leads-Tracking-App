import { Router } from 'express';
import {
  getLeads,
  getStats,
  createLead,
  getLeadById,
  updateLead,
  deleteLead,
} from '../controllers/leadApiController';
import {
  getNotes,
  addNote,
  deleteNote,
} from '../controllers/noteApiController';
import { basicAuth } from '../middleware/auth';

const router = Router();

router.use(basicAuth);

router.get('/leads', getLeads);
router.get('/leads/stats', getStats);
router.post('/leads', createLead);
router.get('/leads/:id', getLeadById);
router.patch('/leads/:id', updateLead);
router.delete('/leads/:id', deleteLead);

router.get('/leads/:id/notes', getNotes);
router.post('/leads/:id/notes', addNote);
router.delete('/leads/:id/notes/:noteId', deleteNote);

export default router;
