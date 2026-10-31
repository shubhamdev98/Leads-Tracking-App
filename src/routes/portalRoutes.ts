import { Router } from 'express';
import { PortalController } from '../controllers/portalController';
import { basicAuth } from '../middleware/auth';

const router = Router();
const portalController = new PortalController();

// Apply optional Basic Authentication if enabled
router.use(basicAuth);

// Root redirects to /leads
router.get('/', (req, res) => res.redirect('/leads'));

// Web Portal Routes
router.get('/leads', portalController.renderLeadsList);

router.get('/leads/new', portalController.renderNewLeadPage);
router.post('/leads/new', portalController.handleCreateLead);

router.get('/leads/:id', portalController.renderLeadDetailPage);

router.get('/leads/:id/edit', portalController.renderEditLeadPage);
router.post('/leads/:id/edit', portalController.handleUpdateLead);

router.post('/leads/:id/delete', portalController.handleDeleteLead);

// Notes Portal Actions
router.post('/leads/:id/notes', portalController.handleAddNote);
router.post('/leads/:id/notes/:noteId/delete', portalController.handleDeleteNote);

export default router;
