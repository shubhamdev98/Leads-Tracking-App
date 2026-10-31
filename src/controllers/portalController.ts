import { Request, Response, NextFunction } from 'express';
import { LeadService } from '../services/leadService';
import { NoteService } from '../services/noteService';
import { VALID_STATUSES } from '../types/lead';
import { ValidationError } from '../services/errors';

export class PortalController {
  constructor(
    private leadService: LeadService = new LeadService(),
    private noteService: NoteService = new NoteService()
  ) {}

  renderLeadsList = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const search = typeof req.query.search === 'string' ? req.query.search : '';
      const status = typeof req.query.status === 'string' ? req.query.status : 'all';
      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limit = Math.max(1, Math.min(50, parseInt(req.query.limit as string, 10) || 10));

      const paginated = this.leadService.getPaginatedLeads({
        search: search.trim() || undefined,
        status: status !== 'all' ? status : undefined,
        page,
        limit,
      });

      const stats = this.leadService.getStats();

      res.render('leads/index', {
        title: 'Lead Management Portal - Leads',
        leads: paginated.data,
        pagination: paginated.pagination,
        stats,
        filters: {
          search,
          status,
          limit,
        },
        validStatuses: VALID_STATUSES,
      });
    } catch (err) {
      next(err);
    }
  };

  renderNewLeadPage = (req: Request, res: Response): void => {
    res.render('leads/new', {
      title: 'Create New Lead - Lead Management Portal',
      formData: { name: '', email: '', phone: '', status: 'new' },
      errors: {},
      validStatuses: VALID_STATUSES,
    });
  };

  handleCreateLead = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { name, email, phone, status } = req.body;
      const lead = this.leadService.createLead({
        name,
        email,
        phone,
        status,
      });

      res.redirect(`/leads/${lead.id}?success=lead_created`);
    } catch (err) {
      if (err instanceof ValidationError) {
        res.status(400).render('leads/new', {
          title: 'Create New Lead - Lead Management Portal',
          formData: req.body,
          errors: err.details || { general: err.message },
          validStatuses: VALID_STATUSES,
        });
        return;
      }
      next(err);
    }
  };

  renderLeadDetailPage = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const id = req.params.id as string;
      const leadWithNotes = this.leadService.getLeadWithNotes(id);
      const successMsg = req.query.success;

      let notification: string | null = null;
      if (successMsg === 'lead_created') notification = 'Lead created successfully!';
      if (successMsg === 'lead_updated') notification = 'Lead details updated successfully!';
      if (successMsg === 'note_added') notification = 'Note added successfully!';

      res.render('leads/show', {
        title: `${leadWithNotes.name} - Lead Details`,
        lead: leadWithNotes,
        notes: leadWithNotes.notes,
        notification,
        validStatuses: VALID_STATUSES,
      });
    } catch (err) {
      next(err);
    }
  };

  renderEditLeadPage = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const id = req.params.id as string;
      const lead = this.leadService.getLeadById(id);

      res.render('leads/edit', {
        title: `Edit ${lead.name} - Lead Management Portal`,
        lead,
        formData: lead,
        errors: {},
        validStatuses: VALID_STATUSES,
      });
    } catch (err) {
      next(err);
    }
  };

  handleUpdateLead = (req: Request, res: Response, next: NextFunction): void => {
    const id = req.params.id as string;
    try {
      const { name, email, phone, status } = req.body;
      this.leadService.updateLead(id, { name, email, phone, status });
      res.redirect(`/leads/${id}?success=lead_updated`);
    } catch (err) {
      if (err instanceof ValidationError) {
        const lead = this.leadService.getLeadById(id);
        res.status(400).render('leads/edit', {
          title: `Edit ${lead.name} - Lead Management Portal`,
          lead,
          formData: { ...req.body, id },
          errors: err.details || { general: err.message },
          validStatuses: VALID_STATUSES,
        });
        return;
      }
      next(err);
    }
  };

  handleDeleteLead = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const id = req.params.id as string;
      this.leadService.deleteLead(id);
      res.redirect('/leads?success=lead_deleted');
    } catch (err) {
      next(err);
    }
  };

  handleAddNote = (req: Request, res: Response, next: NextFunction): void => {
    const id = req.params.id as string;
    try {
      const { content } = req.body;
      this.noteService.addNote(id, { content });
      res.redirect(`/leads/${id}?success=note_added#notes`);
    } catch (err) {
      if (err instanceof ValidationError) {
        const leadWithNotes = this.leadService.getLeadWithNotes(id);
        res.status(400).render('leads/show', {
          title: `${leadWithNotes.name} - Lead Details`,
          lead: leadWithNotes,
          notes: leadWithNotes.notes,
          notification: null,
          noteError: err.message,
          validStatuses: VALID_STATUSES,
        });
        return;
      }
      next(err);
    }
  };

  handleDeleteNote = (req: Request, res: Response, next: NextFunction): void => {
    const id = req.params.id as string;
    const noteId = req.params.noteId as string;
    try {
      this.noteService.deleteNote(noteId);
      res.redirect(`/leads/${id}?success=note_deleted#notes`);
    } catch (err) {
      next(err);
    }
  };
}
