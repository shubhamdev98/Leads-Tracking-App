import { randomUUID } from 'crypto';
import * as leadRepo from '../repositories/leadRepository';
import * as noteRepo from '../repositories/noteRepository';
import { CreateLeadDto, Lead, LeadFilters, LeadStatus, LeadWithNotes, PaginatedResult, UpdateLeadDto, VALID_STATUSES } from '../types/lead';
import { NotFoundError, ValidationError } from './errors';
import { ISqliteDatabase } from '../db/database';

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.length > 254) return false;
  return EMAIL_REGEX.test(trimmed);
}

export function validateCreateLead(dto: CreateLeadDto): { name: string; email: string; phone: string; status: LeadStatus } {
  const errors: Record<string, string> = {};

  if (!dto || typeof dto !== 'object') {
    throw new ValidationError('Request body is required');
  }

  if (!dto.name || typeof dto.name !== 'string' || dto.name.trim().length === 0) {
    errors.name = 'Name is required';
  } else if (dto.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }

  if (!dto.email || typeof dto.email !== 'string' || dto.email.trim().length === 0) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(dto.email)) {
    errors.email = 'Valid email address is required';
  }

  const rawPhone = dto.phone !== undefined ? dto.phone : dto.mobile;
  if (!rawPhone || typeof rawPhone !== 'string' || rawPhone.trim().length === 0) {
    errors.phone = 'Phone number is required';
  }

  let status: LeadStatus = 'new';
  if (dto.status !== undefined && dto.status !== null) {
    if (!VALID_STATUSES.includes(dto.status as LeadStatus)) {
      errors.status = `Status must be one of: ${VALID_STATUSES.join(', ')}`;
    } else {
      status = dto.status as LeadStatus;
    }
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Validation failed', errors);
  }

  return {
    name: dto.name.trim(),
    email: dto.email.trim().toLowerCase(),
    phone: (rawPhone as string).trim(),
    status,
  };
}

export function validateUpdateLead(dto: UpdateLeadDto): Partial<Omit<Lead, 'id' | 'createdAt'>> {
  if (!dto || typeof dto !== 'object') {
    throw new ValidationError('Request body is required');
  }

  const updates: Partial<Omit<Lead, 'id' | 'createdAt'>> = {};
  const errors: Record<string, string> = {};
  let hasField = false;

  if (dto.name !== undefined) {
    hasField = true;
    if (typeof dto.name !== 'string' || dto.name.trim().length === 0) {
      errors.name = 'Name cannot be empty';
    } else if (dto.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    } else {
      updates.name = dto.name.trim();
    }
  }

  if (dto.email !== undefined) {
    hasField = true;
    if (typeof dto.email !== 'string' || !isValidEmail(dto.email)) {
      errors.email = 'Valid email address is required';
    } else {
      updates.email = dto.email.trim().toLowerCase();
    }
  }

  const phoneValue = dto.phone !== undefined ? dto.phone : dto.mobile;
  if (phoneValue !== undefined) {
    hasField = true;
    if (typeof phoneValue !== 'string' || phoneValue.trim().length === 0) {
      errors.phone = 'Phone number cannot be empty';
    } else {
      updates.phone = phoneValue.trim();
    }
  }

  if (dto.status !== undefined) {
    hasField = true;
    if (!VALID_STATUSES.includes(dto.status as LeadStatus)) {
      errors.status = `Status must be one of: ${VALID_STATUSES.join(', ')}`;
    } else {
      updates.status = dto.status as LeadStatus;
    }
  }

  if (!hasField) {
    throw new ValidationError('At least one field (name, email, phone, status) must be provided for update');
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Validation failed', errors);
  }

  return updates;
}

export function createLead(dto: CreateLeadDto, db?: ISqliteDatabase): Lead {
  const validated = validateCreateLead(dto);

  const now = new Date().toISOString();
  const lead: Lead = {
    id: randomUUID(),
    name: validated.name,
    email: validated.email,
    phone: validated.phone,
    status: validated.status,
    createdAt: now,
    updatedAt: now,
  };

  return leadRepo.createLeadRecord(lead, db);
}

export function getLeadById(id: string, db?: ISqliteDatabase): Lead {
  if (!id || typeof id !== 'string') {
    throw new ValidationError('Invalid lead ID');
  }
  const lead = leadRepo.findLeadById(id, db);
  if (!lead) {
    throw new NotFoundError(`Lead with ID '${id}' not found`);
  }
  return lead;
}

export function getLeadWithNotes(id: string, db?: ISqliteDatabase): LeadWithNotes {
  const lead = getLeadById(id, db);
  const notes = noteRepo.findNotesByLeadId(id, db);
  return {
    ...lead,
    notes,
  };
}

export function getLeads(filters: LeadFilters = {}, db?: ISqliteDatabase): { leads: Lead[]; total: number } {
  if (filters.status && filters.status !== 'all') {
    if (!VALID_STATUSES.includes(filters.status as LeadStatus)) {
      throw new ValidationError(`Invalid status filter. Must be one of: ${VALID_STATUSES.join(', ')}`);
    }
  }

  return leadRepo.findAllLeads(filters, db);
}

export function getPaginatedLeads(filters: LeadFilters = {}, db?: ISqliteDatabase): PaginatedResult<Lead> {
  const page = Math.max(1, Number(filters.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(filters.limit) || 10));

  const { leads, total } = leadRepo.findAllLeads({
    ...filters,
    page,
    limit,
  }, db);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    data: leads,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

export function updateLead(id: string, dto: UpdateLeadDto, db?: ISqliteDatabase): Lead {
  getLeadById(id, db);

  const validatedUpdates = validateUpdateLead(dto);
  const updated = leadRepo.updateLeadRecord(id, validatedUpdates, db);

  if (!updated) {
    throw new NotFoundError(`Lead with ID '${id}' not found`);
  }

  return updated;
}

export function deleteLead(id: string, db?: ISqliteDatabase): void {
  getLeadById(id, db);

  const deleted = leadRepo.deleteLeadRecord(id, db);
  if (!deleted) {
    throw new NotFoundError(`Lead with ID '${id}' not found`);
  }
}

export function getStats(db?: ISqliteDatabase) {
  return leadRepo.getLeadStats(db);
}

export function createLeadService(customLeadRepo?: any, customNoteRepo?: any) {
  return {
    isValidEmail,
    validateCreateLead,
    validateUpdateLead,
    createLead: (dto: CreateLeadDto) => {
      if (customLeadRepo) {
        const validated = validateCreateLead(dto);
        const now = new Date().toISOString();
        const lead: Lead = {
          id: randomUUID(),
          name: validated.name,
          email: validated.email,
          phone: validated.phone,
          status: validated.status,
          createdAt: now,
          updatedAt: now,
        };
        return customLeadRepo.create(lead);
      }
      return createLead(dto);
    },
    getLeadById: (id: string) => {
      if (customLeadRepo) {
        if (!id || typeof id !== 'string') throw new ValidationError('Invalid lead ID');
        const lead = customLeadRepo.findById(id);
        if (!lead) throw new NotFoundError(`Lead with ID '${id}' not found`);
        return lead;
      }
      return getLeadById(id);
    },
    getLeadWithNotes: (id: string) => {
      if (customLeadRepo && customNoteRepo) {
        if (!id || typeof id !== 'string') throw new ValidationError('Invalid lead ID');
        const lead = customLeadRepo.findById(id);
        if (!lead) throw new NotFoundError(`Lead with ID '${id}' not found`);
        const notes = customNoteRepo.findByLeadId(id);
        return { ...lead, notes };
      }
      return getLeadWithNotes(id);
    },
    getLeads: (filters: LeadFilters = {}) => {
      if (filters.status && filters.status !== 'all') {
        if (!VALID_STATUSES.includes(filters.status as LeadStatus)) {
          throw new ValidationError(`Invalid status filter. Must be one of: ${VALID_STATUSES.join(', ')}`);
        }
      }
      if (customLeadRepo) return customLeadRepo.findAll(filters);
      return getLeads(filters);
    },
    getPaginatedLeads: (filters: LeadFilters = {}) => {
      const page = Math.max(1, Number(filters.page) || 1);
      const limit = Math.max(1, Math.min(100, Number(filters.limit) || 10));
      const repo = customLeadRepo || leadRepo;
      const { leads, total } = repo.findAll ? repo.findAll({ ...filters, page, limit }) : repo.findAllLeads({ ...filters, page, limit });
      const totalPages = Math.ceil(total / limit) || 1;
      return {
        data: leads,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    },
    updateLead: (id: string, dto: UpdateLeadDto) => {
      if (customLeadRepo) {
        if (!id || typeof id !== 'string') throw new ValidationError('Invalid lead ID');
        const lead = customLeadRepo.findById(id);
        if (!lead) throw new NotFoundError(`Lead with ID '${id}' not found`);
        const validatedUpdates = validateUpdateLead(dto);
        const updated = customLeadRepo.update(id, validatedUpdates);
        if (!updated) throw new NotFoundError(`Lead with ID '${id}' not found`);
        return updated;
      }
      return updateLead(id, dto);
    },
    deleteLead: (id: string) => {
      if (customLeadRepo) {
        if (!id || typeof id !== 'string') throw new ValidationError('Invalid lead ID');
        const lead = customLeadRepo.findById(id);
        if (!lead) throw new NotFoundError(`Lead with ID '${id}' not found`);
        const deleted = customLeadRepo.delete(id);
        if (!deleted) throw new NotFoundError(`Lead with ID '${id}' not found`);
        return;
      }
      return deleteLead(id);
    },
    getStats: () => {
      if (customLeadRepo) return customLeadRepo.getStats();
      return getStats();
    },
  };
}

export const leadService = createLeadService();
export const LeadService = Object.assign(createLeadService as any, { isValidEmail });
