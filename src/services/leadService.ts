import { randomUUID } from 'crypto';
import { LeadRepository } from '../repositories/leadRepository';
import { NoteRepository } from '../repositories/noteRepository';
import { CreateLeadDto, Lead, LeadFilters, LeadStatus, LeadWithNotes, PaginatedResult, UpdateLeadDto, VALID_STATUSES } from '../types/lead';
import { NotFoundError, ValidationError } from './errors';

// Strict email regex validating standard format
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export class LeadService {
  constructor(
    private leadRepo: LeadRepository = new LeadRepository(),
    private noteRepo: NoteRepository = new NoteRepository()
  ) {}

  public static isValidEmail(email: string): boolean {
    if (!email || typeof email !== 'string') return false;
    const trimmed = email.trim();
    if (trimmed.length > 254) return false;
    return EMAIL_REGEX.test(trimmed);
  }

  public validateCreateLead(dto: CreateLeadDto): { name: string; email: string; phone: string; status: LeadStatus } {
    const errors: Record<string, string> = {};

    if (!dto || typeof dto !== 'object') {
      throw new ValidationError('Request body is required');
    }

    // Name validation
    if (!dto.name || typeof dto.name !== 'string' || dto.name.trim().length === 0) {
      errors.name = 'Name is required';
    } else if (dto.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!dto.email || typeof dto.email !== 'string' || dto.email.trim().length === 0) {
      errors.email = 'Email is required';
    } else if (!LeadService.isValidEmail(dto.email)) {
      errors.email = 'Valid email address is required';
    }

    // Phone validation
    if (!dto.phone || typeof dto.phone !== 'string' || dto.phone.trim().length === 0) {
      errors.phone = 'Phone number is required';
    }

    // Status validation
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
      phone: dto.phone.trim(),
      status,
    };
  }

  public validateUpdateLead(dto: UpdateLeadDto): Partial<Omit<Lead, 'id' | 'createdAt'>> {
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
      if (typeof dto.email !== 'string' || !LeadService.isValidEmail(dto.email)) {
        errors.email = 'Valid email address is required';
      } else {
        updates.email = dto.email.trim().toLowerCase();
      }
    }

    if (dto.phone !== undefined) {
      hasField = true;
      if (typeof dto.phone !== 'string' || dto.phone.trim().length === 0) {
        errors.phone = 'Phone number cannot be empty';
      } else {
        updates.phone = dto.phone.trim();
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

  public createLead(dto: CreateLeadDto): Lead {
    const validated = this.validateCreateLead(dto);

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

    return this.leadRepo.create(lead);
  }

  public getLeadById(id: string): Lead {
    if (!id || typeof id !== 'string') {
      throw new ValidationError('Invalid lead ID');
    }
    const lead = this.leadRepo.findById(id);
    if (!lead) {
      throw new NotFoundError(`Lead with ID '${id}' not found`);
    }
    return lead;
  }

  public getLeadWithNotes(id: string): LeadWithNotes {
    const lead = this.getLeadById(id);
    const notes = this.noteRepo.findByLeadId(id);
    return {
      ...lead,
      notes,
    };
  }

  public getLeads(filters: LeadFilters = {}): { leads: Lead[]; total: number } {
    // Validate status filter if provided
    if (filters.status && filters.status !== 'all') {
      if (!VALID_STATUSES.includes(filters.status as LeadStatus)) {
        throw new ValidationError(`Invalid status filter. Must be one of: ${VALID_STATUSES.join(', ')}`);
      }
    }

    return this.leadRepo.findAll(filters);
  }

  public getPaginatedLeads(filters: LeadFilters = {}): PaginatedResult<Lead> {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(filters.limit) || 10));

    const { leads, total } = this.leadRepo.findAll({
      ...filters,
      page,
      limit,
    });

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

  public updateLead(id: string, dto: UpdateLeadDto): Lead {
    // Ensure lead exists
    this.getLeadById(id);

    const validatedUpdates = this.validateUpdateLead(dto);
    const updated = this.leadRepo.update(id, validatedUpdates);

    if (!updated) {
      throw new NotFoundError(`Lead with ID '${id}' not found`);
    }

    return updated;
  }

  public deleteLead(id: string): void {
    // Ensure lead exists
    this.getLeadById(id);

    const deleted = this.leadRepo.delete(id);
    if (!deleted) {
      throw new NotFoundError(`Lead with ID '${id}' not found`);
    }
  }

  public getStats() {
    return this.leadRepo.getStats();
  }
}
