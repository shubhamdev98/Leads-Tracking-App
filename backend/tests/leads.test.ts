/// <reference types="jest" />
import request from 'supertest';
import { createTestApp } from './helpers/testApp';

describe('Leads API Endpoints', () => {
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

  describe('POST /api/leads', () => {
    it('should create a lead successfully with status 201', async () => {
      const payload = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1 555-1234',
        status: 'new',
      };

      const res = await request(app)
        .post('/api/leads')
        .send(payload)
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('John Doe');
      expect(res.body.email).toBe('john.doe@example.com');
      expect(res.body.phone).toBe('+1 555-1234');
      expect(res.body.status).toBe('new');
      expect(res.body).toHaveProperty('createdAt');
    });

    it('should default status to "new" if not provided', async () => {
      const payload = {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '123-456-7890',
      };

      const res = await request(app)
        .post('/api/leads')
        .send(payload)
        .expect(201);

      expect(res.body.status).toBe('new');
    });

    it('should return 400 when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/leads')
        .send({})
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.details).toHaveProperty('name');
      expect(res.body.details).toHaveProperty('email');
      expect(res.body.details).toHaveProperty('phone');
    });

    it('should return 400 for invalid email format', async () => {
      const payload = {
        name: 'Invalid Email Person',
        email: 'notanemail',
        phone: '1234567890',
      };

      const res = await request(app)
        .post('/api/leads')
        .send(payload)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.details.email).toContain('Valid email address is required');
    });

    it('should return 400 when phone number contains alphabets or letters', async () => {
      const payload = {
        name: 'Invalid Phone Person',
        email: 'invalid.phone@example.com',
        phone: '+6446546shhdf',
      };

      const res = await request(app)
        .post('/api/leads')
        .send(payload)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.details.phone).toBe('Phone number cannot contain alphabets');
    });

    it('should return 400 when phone number has invalid format or too few digits', async () => {
      const payload = {
        name: 'Short Phone Person',
        email: 'short.phone@example.com',
        phone: '1234',
      };

      const res = await request(app)
        .post('/api/leads')
        .send(payload)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.details.phone).toBe('Valid phone number is required');
    });

    it('should return 400 for invalid lead status', async () => {
      const payload = {
        name: 'Bob Johnson',
        email: 'bob@example.com',
        phone: '1234567890',
        status: 'invalid_status',
      };

      const res = await request(app)
        .post('/api/leads')
        .send(payload)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.details.status).toContain('Status must be one of');
    });

    it('should allow creating multiple leads with the same email and phone (1 to N relation)', async () => {
      const res1 = await request(app).post('/api/leads').send({
        name: 'Lead One',
        email: 'shared@example.com',
        phone: '111-222-3333',
      }).expect(201);

      const res2 = await request(app).post('/api/leads').send({
        name: 'Lead Two',
        email: 'shared@example.com',
        phone: '111-222-3333',
      }).expect(201);

      expect(res1.body.id).toBeDefined();
      expect(res2.body.id).toBeDefined();
      expect(res1.body.id).not.toBe(res2.body.id);
      expect(res1.body.email).toBe('shared@example.com');
      expect(res2.body.email).toBe('shared@example.com');
    });
  });

  describe('GET /api/leads', () => {
    beforeEach(async () => {
      // Seed test leads
      await request(app).post('/api/leads').send({
        name: 'Alice Johnson',
        email: 'alice@alpha.com',
        phone: '111-1111',
        status: 'new',
      });

      await request(app).post('/api/leads').send({
        name: 'Bob Williams',
        email: 'bob@beta.com',
        phone: '222-2222',
        status: 'contacted',
      });

      await request(app).post('/api/leads').send({
        name: 'Charlie Brown',
        email: 'charlie@gamma.com',
        phone: '333-3333',
        status: 'qualified',
      });
    });

    it('should return all leads as an array by default', async () => {
      const res = await request(app)
        .get('/api/leads')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(3);
      expect(res.headers['x-total-count']).toBe('3');
    });

    it('should filter leads by status', async () => {
      const res = await request(app)
        .get('/api/leads?status=qualified')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toBe('Charlie Brown');
      expect(res.body[0].status).toBe('qualified');
    });

    it('should search leads by name', async () => {
      const res = await request(app)
        .get('/api/leads?search=Alice')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toBe('Alice Johnson');
    });

    it('should search leads by email', async () => {
      const res = await request(app)
        .get('/api/leads?search=beta.com')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].email).toBe('bob@beta.com');
    });

    it('should support pagination when page is requested', async () => {
      const res = await request(app)
        .get('/api/leads?page=1&limit=2')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('pagination');
      expect(res.body.data.length).toBe(2);
      expect(res.body.pagination.total).toBe(3);
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(2);
      expect(res.body.pagination.totalPages).toBe(2);
      expect(res.body.pagination.hasNextPage).toBe(true);
      expect(res.body.pagination.hasPrevPage).toBe(false);
    });
  });

  describe('GET /api/leads/:id', () => {
    it('should return lead by ID', async () => {
      const createRes = await request(app).post('/api/leads').send({
        name: 'Diana Prince',
        email: 'diana@amazon.com',
        phone: '444-4444',
        status: 'qualified',
      });

      const leadId = createRes.body.id;

      const res = await request(app)
        .get(`/api/leads/${leadId}`)
        .expect(200);

      expect(res.body.id).toBe(leadId);
      expect(res.body.name).toBe('Diana Prince');
      expect(res.body.email).toBe('diana@amazon.com');
    });

    it('should return 404 for non-existent lead', async () => {
      const res = await request(app)
        .get('/api/leads/non-existent-id-123')
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('not found');
    });
  });

  describe('PATCH /api/leads/:id', () => {
    it('should update lead status and details', async () => {
      const createRes = await request(app).post('/api/leads').send({
        name: 'Bruce Wayne',
        email: 'bruce@wayne-enterprises.com',
        phone: '555-0199',
        status: 'new',
      });

      const leadId = createRes.body.id;

      const res = await request(app)
        .patch(`/api/leads/${leadId}`)
        .send({
          status: 'contacted',
          phone: '555-9999',
        })
        .expect(200);

      expect(res.body.id).toBe(leadId);
      expect(res.body.status).toBe('contacted');
      expect(res.body.phone).toBe('555-9999');
      expect(res.body.name).toBe('Bruce Wayne'); // Unchanged
    });

    it('should update all lead details (name, email, mobile/phone, status)', async () => {
      const createRes = await request(app).post('/api/leads').send({
        name: 'Peter Parker',
        email: 'peter@dailybugle.com',
        phone: '123-456-7890',
        status: 'new',
      });

      const leadId = createRes.body.id;

      const res = await request(app)
        .patch(`/api/leads/${leadId}`)
        .send({
          name: 'Spider Man',
          email: 'spidey@avengers.org',
          mobile: '987-654-3210',
          status: 'qualified',
        })
        .expect(200);

      expect(res.body.id).toBe(leadId);
      expect(res.body.name).toBe('Spider Man');
      expect(res.body.email).toBe('spidey@avengers.org');
      expect(res.body.phone).toBe('987-654-3210');
      expect(res.body.status).toBe('qualified');
      expect(res.body.updatedAt).toBeDefined();
    });

    it('should return 400 when updating with invalid name or phone', async () => {
      const createRes = await request(app).post('/api/leads').send({
        name: 'Tony Stark',
        email: 'tony@stark.com',
        phone: '555-3000',
      });

      const leadId = createRes.body.id;

      const resName = await request(app)
        .patch(`/api/leads/${leadId}`)
        .send({ name: 'A' })
        .expect(400);

      expect(resName.body.success).toBe(false);

      const resPhone = await request(app)
        .patch(`/api/leads/${leadId}`)
        .send({ phone: '   ' })
        .expect(400);

      expect(resPhone.body.success).toBe(false);

      const resAlphaPhone = await request(app)
        .patch(`/api/leads/${leadId}`)
        .send({ phone: '+6446546shhdf' })
        .expect(400);

      expect(resAlphaPhone.body.success).toBe(false);
      expect(resAlphaPhone.body.details.phone).toBe('Phone number cannot contain alphabets');
    });

    it('should return 400 when updating with invalid email', async () => {
      const createRes = await request(app).post('/api/leads').send({
        name: 'Clark Kent',
        email: 'clark@dailyplanet.com',
        phone: '555-1111',
      });

      const leadId = createRes.body.id;

      const res = await request(app)
        .patch(`/api/leads/${leadId}`)
        .send({ email: 'bad-email' })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should allow updating lead to share same email/phone as another lead', async () => {
      await request(app).post('/api/leads').send({
        name: 'Lead One',
        email: 'lead1@test.com',
        phone: '111-0000',
      }).expect(201);

      const lead2Res = await request(app).post('/api/leads').send({
        name: 'Lead Two',
        email: 'lead2@test.com',
        phone: '222-0000',
      }).expect(201);

      const res = await request(app)
        .patch(`/api/leads/${lead2Res.body.id}`)
        .send({ email: 'lead1@test.com', phone: '111-0000' })
        .expect(200);

      expect(res.body.email).toBe('lead1@test.com');
      expect(res.body.phone).toBe('111-0000');
    });

    it('should allow updating other fields while keeping own email and phone', async () => {
      const createRes = await request(app).post('/api/leads').send({
        name: 'Self Update Lead',
        email: 'self@test.com',
        phone: '777-1234',
        status: 'new',
      }).expect(201);

      const res = await request(app)
        .patch(`/api/leads/${createRes.body.id}`)
        .send({
          email: 'self@test.com',
          phone: '777-1234',
          status: 'contacted',
        })
        .expect(200);

      expect(res.body.status).toBe('contacted');
    });

    it('should return 404 when updating non-existent lead', async () => {
      const res = await request(app)
        .patch('/api/leads/missing-id-456')
        .send({ status: 'lost' })
        .expect(404);

      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/leads/:id', () => {
    it('should delete lead successfully', async () => {
      const createRes = await request(app).post('/api/leads').send({
        name: 'Peter Parker',
        email: 'peter@dailybugle.com',
        phone: '555-3210',
      });

      const leadId = createRes.body.id;

      const deleteRes = await request(app)
        .delete(`/api/leads/${leadId}`)
        .expect(200);

      expect(deleteRes.body.success).toBe(true);

      // Verify lead is gone
      await request(app)
        .get(`/api/leads/${leadId}`)
        .expect(404);
    });

    it('should return 404 when deleting non-existent lead', async () => {
      const res = await request(app)
        .delete('/api/leads/does-not-exist')
        .expect(404);

      expect(res.body.success).toBe(false);
    });
  });
});
