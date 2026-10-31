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

export interface Stats {
  total: number;
  new: number;
  contacted: number;
  qualified: number;
  lost: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedLeadsResponse {
  data: Lead[];
  pagination: Pagination;
}
