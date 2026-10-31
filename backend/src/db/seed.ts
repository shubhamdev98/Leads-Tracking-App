import { randomUUID } from 'crypto';
import { initDatabaseEngine, getDatabase, closeDatabase } from './database';
import { createLeadRecord } from '../repositories/leadRepository';
import { createNoteRecord } from '../repositories/noteRepository';
import { Lead, Note } from '../types/lead';

export async function seedDatabase(): Promise<void> {
  await initDatabaseEngine();
  const db = getDatabase();

  const sampleLeads: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      name: 'Sarah Connor',
      email: 'sarah.connor@cyberdyne-defense.com',
      phone: '+1 (555) 234-5678',
      status: 'new',
    },
    {
      name: 'Alexander Wright',
      email: 'a.wright@acmesolutions.io',
      phone: '+1 (555) 872-9102',
      status: 'contacted',
    },
    {
      name: 'Elena Rostova',
      email: 'elena.rostova@quantum-fintech.com',
      phone: '+44 20 7946 0912',
      status: 'qualified',
    },
    {
      name: 'Marcus Brody',
      email: 'marcus.brody@museum-archaeology.edu',
      phone: '+1 (555) 431-7788',
      status: 'lost',
    },
    {
      name: 'Jessica Pearson',
      email: 'j.pearson@pearson-specter.law',
      phone: '+1 (212) 555-0199',
      status: 'qualified',
    },
    {
      name: 'David Chen',
      email: 'david.chen@horizon-robotics.ai',
      phone: '+1 (415) 555-0143',
      status: 'new',
    },
    {
      name: 'Amara Okafor',
      email: 'amara@solargrid-dynamics.ng',
      phone: '+234 1 234 5678',
      status: 'contacted',
    },
    {
      name: 'Liam Gallagher',
      email: 'liam.g@soundtrack-studios.co.uk',
      phone: '+44 161 496 0123',
      status: 'new',
    },
  ];

  const sampleNotesByStatus: Record<string, string[]> = {
    new: [
      'Lead captured through company website contact form.',
      'Auto-responder email delivered successfully.',
    ],
    contacted: [
      'Introductory phone call completed. Lead expressed interest in the Enterprise tier.',
      'Sent product pricing sheet and deck via email.',
    ],
    qualified: [
      'Decision maker confirmed (VP of Operations). Budget approved for Q4.',
      'Completed product demo. Addressed SSO and data export requirements.',
      'Contract proposal drafted and awaiting legal review.',
    ],
    lost: [
      'Initial discussion held, but client decided to build an in-house tool.',
      'Added reminder to re-engage in 6 months for future roadmap review.',
    ],
  };

  const now = Date.now();

  sampleLeads.forEach((leadData, index) => {
    const createdDate = new Date(now - (sampleLeads.length - index) * 3600 * 1000 * 24).toISOString();
    const leadId = randomUUID();

    const lead: Lead = {
      id: leadId,
      name: leadData.name,
      email: leadData.email,
      phone: leadData.phone,
      status: leadData.status,
      createdAt: createdDate,
      updatedAt: createdDate,
    };

    createLeadRecord(lead, db);

    const notesContent = sampleNotesByStatus[lead.status] || ['Initial contact recorded.'];
    notesContent.forEach((content, noteIndex) => {
      const noteDate = new Date(new Date(createdDate).getTime() + (noteIndex + 1) * 3600 * 1000 * 3).toISOString();
      const note: Note = {
        id: randomUUID(),
        leadId,
        content,
        createdAt: noteDate,
      };
      createNoteRecord(note, db);
    });
  });

  console.log('Database seeded successfully.');
}

if (require.main === module) {
  seedDatabase()
    .then(() => {
      closeDatabase();
      process.exit(0);
    })
    .catch((err) => {
      console.error('Failed to seed database:', err);
      process.exit(1);
    });
}
