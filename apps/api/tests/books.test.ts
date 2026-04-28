import request from 'supertest';
import { app } from '../src/app';
import { setupTestData } from './helpers/testDataDir';

setupTestData();

describe('GET /api/books', () => {
  it('returns all 50 seed books', async () => {
    const res = await request(app).get('/api/books').expect(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data).toHaveLength(50);
  });

  it('filters by genre — exact match (Technology)', async () => {
    const res = await request(app).get('/api/books?genre=Technology').expect(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data.every((b: { genre: string }) => b.genre === 'Technology')).toBe(true);
  });

  it('filters by genre — prefix match (Philos → Philosophy)', async () => {
    const res = await request(app).get('/api/books?genre=Philos').expect(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data.every((b: { genre: string }) => b.genre === 'Philosophy')).toBe(true);
  });

  it('filters by genre — partial match returns all genres containing the term', async () => {
    // "fiction" is a substring of both "Fiction" and "Non-Fiction"
    const res = await request(app).get('/api/books?genre=fiction').expect(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(
      res.body.data.every((b: { genre: string }) =>
        b.genre.toLowerCase().includes('fiction'),
      ),
    ).toBe(true);
    const genres = [...new Set((res.body.data as { genre: string }[]).map((b) => b.genre))];
    expect(genres).toEqual(expect.arrayContaining(['Fiction', 'Non-Fiction']));
  });

  it('filters by genre — more specific prefix (Non-Fi → Non-Fiction only)', async () => {
    const res = await request(app).get('/api/books?genre=Non-Fi').expect(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data.every((b: { genre: string }) => b.genre === 'Non-Fiction')).toBe(true);
  });

  it('filters by genre — case-insensitive (TECH → Technology)', async () => {
    const res = await request(app).get('/api/books?genre=TECH').expect(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data.every((b: { genre: string }) => b.genre === 'Technology')).toBe(true);
  });

  it('filters by genre — returns empty for no match', async () => {
    const res = await request(app).get('/api/books?genre=zzznomatch').expect(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('filters by year', async () => {
    const res = await request(app).get('/api/books?year=2019').expect(200);
    expect(res.body.data.every((b: { year: number }) => b.year === 2019)).toBe(true);
  });

  it('returns 400 for invalid year param', async () => {
    await request(app).get('/api/books?year=notanumber').expect(400);
  });
});

describe('GET /api/books/search', () => {
  it('finds books by title', async () => {
    const res = await request(app).get('/api/books/search?q=pragmatic').expect(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].title).toContain('Pragmatic');
  });

  it('finds books by author', async () => {
    const res = await request(app).get('/api/books/search?q=orwell').expect(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('finds books by genre', async () => {
    const res = await request(app).get('/api/books/search?q=philosophy').expect(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('returns empty array for no matches', async () => {
    const res = await request(app).get('/api/books/search?q=zzznomatch').expect(200);
    expect(res.body.data).toHaveLength(0);
  });
});

describe('GET /api/books/:id', () => {
  it('returns a book with its reviews', async () => {
    const res = await request(app).get('/api/books/bk_001').expect(200);
    expect(res.body.data.book.id).toBe('bk_001');
    expect(res.body.data.reviews).toBeInstanceOf(Array);
  });

  it('returns 404 for unknown id', async () => {
    const res = await request(app).get('/api/books/bk_9999').expect(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('POST /api/books', () => {
  it('creates a book and returns 201', async () => {
    const payload = {
      title: 'Test Book',
      author: 'Test Author',
      genre: 'Fiction',
      year: 2020,
    };
    const res = await request(app).post('/api/books').send(payload).expect(201);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.title).toBe('Test Book');
    expect(res.body.data.addedAt).toBeDefined();
  });

  it('returns 400 for missing required fields', async () => {
    const res = await request(app).post('/api/books').send({ title: '' }).expect(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 for invalid year', async () => {
    await request(app)
      .post('/api/books')
      .send({ title: 'X', author: 'Y', genre: 'Fiction', year: 999 })
      .expect(400);
  });
});

describe('PUT /api/books/:id', () => {
  it('updates a book', async () => {
    const res = await request(app)
      .put('/api/books/bk_002')
      .send({ title: 'Clean Code (Updated)' })
      .expect(200);
    expect(res.body.data.title).toBe('Clean Code (Updated)');
    expect(res.body.data.id).toBe('bk_002');
  });

  it('returns 404 for unknown id', async () => {
    await request(app).put('/api/books/bk_9999').send({ title: 'X' }).expect(404);
  });
});

describe('DELETE /api/books/:id', () => {
  it('deletes a book and returns 204', async () => {
    await request(app).delete('/api/books/bk_050').expect(204);
  });

  it('returns 404 when deleting a non-existent book', async () => {
    await request(app).delete('/api/books/bk_9999').expect(404);
  });
});
