import { Lead, Note, Stats, PaginatedLeadsResponse } from '../types';

export class ApiError extends Error {
  public statusCode: number;
  public details?: any;

  constructor(message: string, statusCode: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  const defaultHeaders: Record<string, string> = {
    'Accept': 'application/json',
  };

  if (options.body && !(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const errorMsg = data?.error || data?.message || `Request failed with status ${response.status}`;
    throw new ApiError(errorMsg, response.status, data?.details);
  }

  return data as T;
}

export const api = {
  // Leads
  async getLeads(params: { search?: string; status?: string; page?: number; limit?: number } = {}): Promise<PaginatedLeadsResponse> {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.status && params.status !== 'all') query.set('status', params.status);
    query.set('page', String(params.page || 1));
    query.set('limit', String(params.limit || 10));

    return request<PaginatedLeadsResponse>(`/api/leads?${query.toString()}`);
  },

  async getLead(id: string): Promise<Lead> {
    return request<Lead>(`/api/leads/${id}`);
  },

  async getStats(): Promise<Stats> {
    return request<Stats>('/api/leads/stats');
  },

  async createLead(leadData: { name: string; email: string; phone: string; status?: string }): Promise<Lead> {
    return request<Lead>('/api/leads', {
      method: 'POST',
      body: JSON.stringify(leadData),
    });
  },

  async updateLead(id: string, updates: Partial<{ name: string; email: string; phone: string; status: string }>): Promise<Lead> {
    return request<Lead>(`/api/leads/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async deleteLead(id: string): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>(`/api/leads/${id}`, {
      method: 'DELETE',
    });
  },

  // Notes
  async getNotes(leadId: string): Promise<Note[]> {
    return request<Note[]>(`/api/leads/${leadId}/notes`);
  },

  async addNote(leadId: string, content: string): Promise<Note> {
    return request<Note>(`/api/leads/${leadId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  async deleteNote(leadId: string, noteId: string): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>(`/api/leads/${leadId}/notes/${noteId}`, {
      method: 'DELETE',
    });
  },
};
