import { Request, Response, NextFunction } from 'express';
import { LeadService } from '../services/leadService';
import { LeadFilters } from '../types/lead';

export class LeadApiController {
  constructor(private leadService: LeadService = new LeadService()) {}

  getLeads = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { search, status, page, limit, format } = req.query;

      const filters: LeadFilters = {
        search: typeof search === 'string' ? search : undefined,
        status: typeof status === 'string' ? status : undefined,
      };

      // If pagination is requested via page, limit, or format=paginated
      const isPaginationRequested = page !== undefined || limit !== undefined || format === 'paginated';

      if (isPaginationRequested) {
        const paginated = this.leadService.getPaginatedLeads({
          ...filters,
          page: page ? parseInt(page as string, 10) : 1,
          limit: limit ? parseInt(limit as string, 10) : 10,
        });

        res.setHeader('X-Total-Count', paginated.pagination.total);
        res.setHeader('X-Page', paginated.pagination.page);
        res.setHeader('X-Total-Pages', paginated.pagination.totalPages);

        res.status(200).json(paginated);
        return;
      }

      // Default: Return direct array of leads matching filters
      const { leads, total } = this.leadService.getLeads(filters);

      res.setHeader('X-Total-Count', total);
      res.status(200).json(leads);
    } catch (err) {
      next(err);
    }
  };

  getLeadById = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const id = req.params.id as string;
      const lead = this.leadService.getLeadById(id);
      res.status(200).json(lead);
    } catch (err) {
      next(err);
    }
  };

  createLead = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const lead = this.leadService.createLead(req.body);
      res.status(201).json(lead);
    } catch (err) {
      next(err);
    }
  };

  updateLead = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const id = req.params.id as string;
      const updated = this.leadService.updateLead(id, req.body);
      res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  };

  deleteLead = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const id = req.params.id as string;
      this.leadService.deleteLead(id);
      res.status(200).json({
        success: true,
        message: 'Lead deleted successfully',
        id,
      });
    } catch (err) {
      next(err);
    }
  };

  getStats = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const stats = this.leadService.getStats();
      res.status(200).json(stats);
    } catch (err) {
      next(err);
    }
  };
}
