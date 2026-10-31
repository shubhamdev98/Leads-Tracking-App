import { ISqliteDatabase, getDatabase } from '../db/database';
import { Lead, LeadFilters, LeadStatus } from '../types/lead';

export function createLeadRecord(lead: Lead, customDb?: ISqliteDatabase): Lead {
  const db = customDb || getDatabase();
  const stmt = db.prepare(`
    INSERT INTO leads (id, name, email, phone, status, createdAt, updatedAt)
    VALUES (@id, @name, @email, @phone, @status, @createdAt, @updatedAt)
  `);

  stmt.run({
    id: lead.id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    status: lead.status,
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt || lead.createdAt,
  });

  return lead;
}

export function findLeadById(id: string, customDb?: ISqliteDatabase): Lead | null {
  const db = customDb || getDatabase();
  const stmt = db.prepare('SELECT * FROM leads WHERE id = ?');
  const row = stmt.get(id) as Lead | undefined;
  return row || null;
}

export function findLeadByEmail(email: string, customDb?: ISqliteDatabase): Lead | null {
  const db = customDb || getDatabase();
  const stmt = db.prepare('SELECT * FROM leads WHERE LOWER(email) = LOWER(?)');
  const row = stmt.get(email) as Lead | undefined;
  return row || null;
}

export function findAllLeads(filters: LeadFilters = {}, customDb?: ISqliteDatabase): { leads: Lead[]; total: number } {
  const db = customDb || getDatabase();
  const { search, status, page, limit } = filters;
  const whereClauses: string[] = [];
  const params: (string | number)[] = [];

  if (search && search.trim()) {
    whereClauses.push('(LOWER(name) LIKE ? OR LOWER(email) LIKE ?)');
    const searchPattern = `%${search.trim().toLowerCase()}%`;
    params.push(searchPattern, searchPattern);
  }

  if (status && status !== 'all') {
    whereClauses.push('status = ?');
    params.push(status);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const countSql = `SELECT COUNT(*) as total FROM leads ${whereSql}`;
  const totalRow = db.prepare(countSql).get(...params) as { total: number };
  const total = totalRow ? totalRow.total : 0;

  let dataSql = `SELECT * FROM leads ${whereSql} ORDER BY createdAt DESC`;
  const dataParams = [...params];

  if (limit && limit > 0) {
    dataSql += ` LIMIT ?`;
    dataParams.push(limit);

    if (page && page > 0) {
      const offset = (page - 1) * limit;
      dataSql += ` OFFSET ?`;
      dataParams.push(offset);
    }
  }

  const leads = db.prepare(dataSql).all(...dataParams) as Lead[];
  return { leads, total };
}

export function updateLeadRecord(id: string, updates: Partial<Omit<Lead, 'id' | 'createdAt'>>, customDb?: ISqliteDatabase): Lead | null {
  const db = customDb || getDatabase();
  const fields: string[] = [];
  const params: Record<string, any> = { id };

  if (updates.name !== undefined) {
    fields.push('name = @name');
    params.name = updates.name;
  }
  if (updates.email !== undefined) {
    fields.push('email = @email');
    params.email = updates.email;
  }
  if (updates.phone !== undefined) {
    fields.push('phone = @phone');
    params.phone = updates.phone;
  }
  if (updates.status !== undefined) {
    fields.push('status = @status');
    params.status = updates.status;
  }

  if (fields.length === 0) {
    return findLeadById(id, db);
  }

  fields.push('updatedAt = @updatedAt');
  params.updatedAt = new Date().toISOString();

  const sql = `UPDATE leads SET ${fields.join(', ')} WHERE id = @id`;
  const result = db.prepare(sql).run(params);

  if (result.changes === 0) {
    return null;
  }

  return findLeadById(id, db);
}

export function deleteLeadRecord(id: string, customDb?: ISqliteDatabase): boolean {
  const db = customDb || getDatabase();
  const stmt = db.prepare('DELETE FROM leads WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

export function countLeads(customDb?: ISqliteDatabase): number {
  const db = customDb || getDatabase();
  const row = db.prepare('SELECT COUNT(*) as total FROM leads').get() as { total: number };
  return row ? row.total : 0;
}

export function getLeadStats(customDb?: ISqliteDatabase): { total: number; new: number; contacted: number; qualified: number; lost: number } {
  const db = customDb || getDatabase();
  const rows = db.prepare(`
    SELECT status, COUNT(*) as count
    FROM leads
    GROUP BY status
  `).all() as { status: LeadStatus; count: number }[];

  const stats = {
    total: 0,
    new: 0,
    contacted: 0,
    qualified: 0,
    lost: 0,
  };

  for (const row of rows) {
    if (row.status in stats) {
      stats[row.status] = row.count;
    }
    stats.total += row.count;
  }

  return stats;
}

export function createLeadRepository(db?: ISqliteDatabase) {
  return {
    create: (lead: Lead) => createLeadRecord(lead, db),
    findById: (id: string) => findLeadById(id, db),
    findByEmail: (email: string) => findLeadByEmail(email, db),
    findAll: (filters: LeadFilters = {}) => findAllLeads(filters, db),
    update: (id: string, updates: Partial<Omit<Lead, 'id' | 'createdAt'>>) => updateLeadRecord(id, updates, db),
    delete: (id: string) => deleteLeadRecord(id, db),
    count: () => countLeads(db),
    getStats: () => getLeadStats(db),
  };
}

export const leadRepository = createLeadRepository();
export const LeadRepository = createLeadRepository as any;
