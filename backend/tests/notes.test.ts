/// <reference types="jest" />
import request from 'supertest';
import { createTestApp } from './helpers/testApp';

describe('Notes API Endpoints', () => {
  let app: any;
  let context: any;

  beforeEach(() => {
    const testSetup = createTestApp(false);
    app = testSetup.app;
    context = testSetup.context;
  });

  afterEach(() => {
    context.cleanup();
  });

  describe('GET /api/leads/:id/notes', () => {
    it('should return 404 when lead does not exist', async () => {
      const res = await request(app)
        .get('/api/leads/non-existent-lead-id/notes')
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('not found');
    });

    it('should return an empty array for a lead with no notes', async () => {
      const leadRes = await request(app).post('/api/leads').send({
        name: 'Tony Stark',
        email: 'tony@starkindustries.com',
        phone: '555-3000',
      });

      const leadId = leadRes.body.id;

      const res = await request(app)
        .get(`/api/leads/${leadId}/notes`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    it('should return all notes for a lead in chronological order', async () => {
      const leadRes = await request(app).post('/api/leads').send({
        name: 'Steve Rogers',
        email: 'steve@avengers.org',
        phone: '555-1941',
      });

      const leadId = leadRes.body.id;

      // Add two notes
      await request(app)
        .post(`/api/leads/${leadId}/notes`)
        .send({ content: 'Initial outreach call.' });

      await request(app)
        .post(`/api/leads/${leadId}/notes`)
        .send({ content: 'Follow-up email sent.' });

      const res = await request(app)
        .get(`/api/leads/${leadId}/notes`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
      expect(res.body[0].leadId).toBe(leadId);
      expect(res.body[1].leadId).toBe(leadId);
      expect(res.body[0]).toHaveProperty('content');
      expect(res.body[0]).toHaveProperty('createdAt');
    });
  });

  describe('POST /api/leads/:id/notes', () => {
    it('should add a note to a lead and return 201', async () => {
      const leadRes = await request(app).post('/api/leads').send({
        name: 'Natasha Romanoff',
        email: 'natasha@shield.gov',
        phone: '555-0077',
      });

      const leadId = leadRes.body.id;

      const res = await request(app)
        .post(`/api/leads/${leadId}/notes`)
        .send({ content: 'Confidential briefing requested for next Tuesday.' })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.leadId).toBe(leadId);
      expect(res.body.content).toBe('Confidential briefing requested for next Tuesday.');
      expect(res.body).toHaveProperty('createdAt');
    });

    it('should return 400 when note content is empty or whitespace', async () => {
      const leadRes = await request(app).post('/api/leads').send({
        name: 'Thor Odinson',
        email: 'thor@asgard.realm',
        phone: '555-8467',
      });

      const leadId = leadRes.body.id;

      const res = await request(app)
        .post(`/api/leads/${leadId}/notes`)
        .send({ content: '   ' })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Note content is required');
    });

    it('should return 404 when adding note to non-existent lead', async () => {
      const res = await request(app)
        .post('/api/leads/missing-lead-id/notes')
        .send({ content: 'Some note content' })
        .expect(404);

      expect(res.body.success).toBe(false);
    });
  });

  describe('Cascading Deletion of Notes', () => {
    it('should automatically cascade delete all notes when parent lead is deleted', async () => {
      const leadRes = await request(app).post('/api/leads').send({
        name: 'Wanda Maximoff',
        email: 'wanda@westview.io',
        phone: '555-9090',
      });

      const leadId = leadRes.body.id;

      // Add 2 notes
      await request(app)
        .post(`/api/leads/${leadId}/notes`)
        .send({ content: 'Note 1' });

      await request(app)
        .post(`/api/leads/${leadId}/notes`)
        .send({ content: 'Note 2' });

      expect(context.noteRepo.findByLeadId(leadId).length).toBe(2);

      // Delete the lead
      await request(app)
        .delete(`/api/leads/${leadId}`)
        .expect(200);

      // Verify cascading delete removed notes
      expect(context.noteRepo.findByLeadId(leadId).length).toBe(0);
    });
  });
});
