export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'lost';

export const VALID_STATUSES: LeadStatus[] = ['new', 'contacted', 'qualified', 'lost'];

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: LeadStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface Note {
  id: string;
  leadId: string;
  content: string;
  createdAt: string;
}

export interface LeadWithNotes extends Lead {
  notes: Note[];
}

export interface CreateLeadDto {
  name: string;
  email: string;
  phone: string;
  status?: LeadStatus;
}

export interface UpdateLeadDto {
  name?: string;
  email?: string;
  phone?: string;
  status?: LeadStatus;
}

export interface CreateNoteDto {
  content: string;
}

export interface LeadFilters {
  search?: string;
  status?: LeadStatus | string;
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
