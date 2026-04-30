import request from 'supertest';
import { app } from '../src/app';
import { setupTestData } from './helpers/testDataDir';

setupTestData();

let createdShelfId: string;

describe('POST /api/shelves', () => {
  it('creates a shelf and returns 201', async () => {
    const res = await request(app)
      .post('/api/shelves')
      .send({ userId: 'user_1', name: 'Want to Read' })
      .expect(201);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.name).toBe('Want to Read');
    expect(res.body.data.bookIds).toEqual([]);
    createdShelfId = res.body.data.id as string;
  });

  it('returns 400 for missing userId', async () => {
    await request(app).post('/api/shelves').send({ name: 'My Shelf' }).expect(400);
  });
});

describe('GET /api/shelves', () => {
  it('returns all shelves', async () => {
    const res = await request(app).get('/api/shelves').expect(200);
    expect(res.body.data).toBeInstanceOf(Array);
  });

  it('filters shelves by userId', async () => {
    const res = await request(app).get('/api/shelves?userId=user_1').expect(200);
    expect(res.body.data.every((s: { userId: string }) => s.userId === 'user_1')).toBe(true);
  });
});

describe('GET /api/shelves/:id', () => {
  it('returns a shelf by id', async () => {
    const res = await request(app).get(`/api/shelves/${createdShelfId}`).expect(200);
    expect(res.body.data.id).toBe(createdShelfId);
  });

  it('returns 404 for unknown shelf id', async () => {
    await request(app).get('/api/shelves/unknown-shelf').expect(404);
  });
});

describe('POST /api/shelves/:id/books', () => {
  it('adds a book to a shelf', async () => {
    const res = await request(app)
      .post(`/api/shelves/${createdShelfId}/books`)
      .send({ bookId: 'bk_001' })
      .expect(200);
    expect(res.body.data.bookIds).toContain('bk_001');
  });

  it('returns 409 when adding a duplicate book', async () => {
    const res = await request(app)
      .post(`/api/shelves/${createdShelfId}/books`)
      .send({ bookId: 'bk_001' })
      .expect(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('returns 404 for unknown book', async () => {
    await request(app)
      .post(`/api/shelves/${createdShelfId}/books`)
      .send({ bookId: 'bk_9999' })
      .expect(404);
  });

  it('returns 404 for unknown shelf', async () => {
    await request(app)
      .post('/api/shelves/unknown-shelf/books')
      .send({ bookId: 'bk_001' })
      .expect(404);
  });
});

describe('DELETE /api/shelves/:id/books/:bookId', () => {
  it('removes a book from a shelf', async () => {
    const res = await request(app)
      .delete(`/api/shelves/${createdShelfId}/books/bk_001`)
      .expect(200);
    expect(res.body.data.bookIds).not.toContain('bk_001');
  });

  it('returns 404 when removing a book not on the shelf', async () => {
    await request(app)
      .delete(`/api/shelves/${createdShelfId}/books/bk_999`)
      .expect(404);
  });
});

describe('DELETE /api/shelves/:id', () => {
  it('deletes a shelf and returns 204', async () => {
    const createRes = await request(app)
      .post('/api/shelves')
      .send({ userId: 'user_delete', name: 'To Delete' })
      .expect(201);
    const shelfId = createRes.body.data.id as string;

    await request(app).delete(`/api/shelves/${shelfId}`).expect(204);
    await request(app).get(`/api/shelves/${shelfId}`).expect(404);
  });

  it('returns 404 for unknown shelf id', async () => {
    await request(app).delete('/api/shelves/unknown-shelf').expect(404);
  });
});
