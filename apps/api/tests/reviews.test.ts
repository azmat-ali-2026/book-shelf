import request from 'supertest';
import { app } from '../src/app';
import { setupTestData } from './helpers/testDataDir';

setupTestData();

describe('POST /api/books/:id/reviews', () => {
  it('creates a review and returns 201', async () => {
    const res = await request(app)
      .post('/api/books/bk_001/reviews')
      .send({ userId: 'user_1', rating: 5, text: 'Essential reading!' })
      .expect(201);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.rating).toBe(5);
    expect(res.body.data.bookId).toBe('bk_001');
  });

  it('creates a review without optional text', async () => {
    const res = await request(app)
      .post('/api/books/bk_001/reviews')
      .send({ userId: 'user_2', rating: 4 })
      .expect(201);
    expect(res.body.data.rating).toBe(4);
  });

  it('returns 400 for rating out of range', async () => {
    const res = await request(app)
      .post('/api/books/bk_001/reviews')
      .send({ userId: 'user_1', rating: 6 })
      .expect(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 for missing rating', async () => {
    await request(app)
      .post('/api/books/bk_001/reviews')
      .send({ userId: 'user_1' })
      .expect(400);
  });

  it('returns 404 for unknown book', async () => {
    await request(app)
      .post('/api/books/bk_9999/reviews')
      .send({ userId: 'user_1', rating: 3 })
      .expect(404);
  });
});

describe('GET /api/books/:id/reviews', () => {
  it('returns reviews for a book', async () => {
    const res = await request(app).get('/api/books/bk_001/reviews').expect(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('returns empty array for book with no reviews', async () => {
    const res = await request(app).get('/api/books/bk_010/reviews').expect(200);
    expect(res.body.data).toEqual([]);
  });

  it('returns 404 for unknown book', async () => {
    await request(app).get('/api/books/bk_9999/reviews').expect(404);
  });
});
