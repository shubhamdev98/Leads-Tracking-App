import { Request, Response, NextFunction } from 'express';
import * as leadService from '../services/leadService';
import { LeadFilters } from '../types/lead';

export type LeadServiceInstance = ReturnType<typeof leadService.createLeadService>;

export function createLeadApiController(service: any = leadService.leadService) {
  return {
    getLeads: (req: Request, res: Response, next: NextFunction): void => {
      try {
        const { search, status, page, limit, format } = req.query;

        const filters: LeadFilters = {
          search: typeof search === 'string' ? search : undefined,
          status: typeof status === 'string' ? status : undefined,
        };

        const isPaginationRequested = page !== undefined || limit !== undefined || format === 'paginated';

        if (isPaginationRequested) {
          const paginated = service.getPaginatedLeads({
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

        const { leads, total } = service.getLeads(filters);

        res.setHeader('X-Total-Count', total);
        res.status(200).json(leads);
      } catch (err) {
        next(err);
      }
    },

    getLeadById: (req: Request, res: Response, next: NextFunction): void => {
      try {
        const id = req.params.id as string;
        const lead = service.getLeadById(id);
        res.status(200).json(lead);
      } catch (err) {
        next(err);
      }
    },

    createLead: (req: Request, res: Response, next: NextFunction): void => {
      try {
        const lead = service.createLead(req.body);
        res.status(201).json(lead);
      } catch (err) {
        next(err);
      }
    },

    updateLead: (req: Request, res: Response, next: NextFunction): void => {
      try {
        const id = req.params.id as string;
        const updated = service.updateLead(id, req.body);
        res.status(200).json(updated);
      } catch (err) {
        next(err);
      }
    },

    deleteLead: (req: Request, res: Response, next: NextFunction): void => {
      try {
        const id = req.params.id as string;
        service.deleteLead(id);
        res.status(200).json({
          success: true,
          message: 'Lead deleted successfully',
          id,
        });
      } catch (err) {
        next(err);
      }
    },

    getStats: (req: Request, res: Response, next: NextFunction): void => {
      try {
        const stats = service.getStats();
        res.status(200).json(stats);
      } catch (err) {
        next(err);
      }
    },
  };
}

const defaultController = createLeadApiController();

export const getLeads = defaultController.getLeads;
export const getLeadById = defaultController.getLeadById;
export const createLead = defaultController.createLead;
export const updateLead = defaultController.updateLead;
export const deleteLead = defaultController.deleteLead;
export const getStats = defaultController.getStats;

export function LeadApiController(this: any, service: any = leadService.leadService) {
  const handlers = createLeadApiController(service);
  if (this instanceof LeadApiController) {
    Object.assign(this, handlers);
    return this;
  }
  return handlers;
}
