/**
 * Unit tests for the POST /api/books (addBook) controller.
 *
 * Strategy: mount only the books router on a minimal Express app so every
 * test runs without touching the filesystem. bookService is fully mocked so
 * the controller is the only real code under test.
 */

import express from 'express';
import request from 'supertest';
import { booksRouter } from '../../src/routes/books';
import { errorHandler } from '../../src/middleware/errorHandler';
import { notFound } from '../../src/middleware/notFound';

// ── Mock bookService ────────────────────────────────────────────────────────

jest.mock('../../src/services/bookService', () => ({
  bookService: {
    createBook: jest.fn(),
    listBooks: jest.fn().mockReturnValue([]),
    getBookWithReviews: jest.fn(),
    updateBook: jest.fn(),
    deleteBook: jest.fn(),
    searchBooks: jest.fn().mockReturnValue([]),
  },
}));

// Also mock reviewService so the router can be imported cleanly
jest.mock('../../src/services/reviewService', () => ({
  reviewService: {
    getReviewsForBook: jest.fn().mockReturnValue([]),
    createReview: jest.fn(),
  },
}));

import { bookService } from '../../src/services/bookService';

const mockCreateBook = bookService.createBook as jest.Mock;

// ── Minimal test app ────────────────────────────────────────────────────────

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/books', booksRouter);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}

const app = buildApp();

// ── Helpers ─────────────────────────────────────────────────────────────────

const VALID_PAYLOAD = {
  title: 'The Pragmatic Programmer',
  author: 'David Thomas',
  genre: 'Technology',
  year: 2019,
};

const MOCK_BOOK = {
  id: '01HWZEXAMPLE123',
  ...VALID_PAYLOAD,
  addedAt: '2024-01-01T00:00:00.000Z',
};

// ── Tests ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
});

// ────────────────────────────────────────────────────────────────────────────
// SUCCESS — 201
// ────────────────────────────────────────────────────────────────────────────

describe('POST /api/books — success (201)', () => {
  it('returns 201 and the created book for a valid payload', async () => {
    mockCreateBook.mockReturnValue(MOCK_BOOK);

    const res = await request(app)
      .post('/api/books')
      .send(VALID_PAYLOAD)
      .expect(201);

    expect(res.body.data).toMatchObject({
      id: expect.any(String),
      title: 'The Pragmatic Programmer',
      author: 'David Thomas',
      genre: 'Technology',
      year: 2019,
      addedAt: expect.any(String),
    });
  });

  it('calls bookService.createBook with the validated body', async () => {
    mockCreateBook.mockReturnValue(MOCK_BOOK);

    await request(app).post('/api/books').send(VALID_PAYLOAD).expect(201);

    expect(mockCreateBook).toHaveBeenCalledTimes(1);
    expect(mockCreateBook).toHaveBeenCalledWith(VALID_PAYLOAD);
  });

  it('returns 201 with optional fields (isbn, description, coverUrl)', async () => {
    const payload = {
      ...VALID_PAYLOAD,
      isbn: '978-0-13-595705-9',
      description: 'A classic software engineering book.',
      coverUrl: 'https://example.com/cover.jpg',
    };
    const mockWithOptionals = { id: '01HWZEXAMPLE456', ...payload, addedAt: '2024-01-01T00:00:00.000Z' };
    mockCreateBook.mockReturnValue(mockWithOptionals);

    const res = await request(app).post('/api/books').send(payload).expect(201);

    expect(res.body.data.isbn).toBe('978-0-13-595705-9');
    expect(res.body.data.description).toBe('A classic software engineering book.');
    expect(res.body.data.coverUrl).toBe('https://example.com/cover.jpg');
  });

  it('accepts a null coverUrl', async () => {
    const payload = { ...VALID_PAYLOAD, coverUrl: null };
    mockCreateBook.mockReturnValue({ id: '01HWZEXAMPLE789', ...payload, addedAt: '2024-01-01T00:00:00.000Z' });

    await request(app).post('/api/books').send(payload).expect(201);

    expect(mockCreateBook).toHaveBeenCalledWith(expect.objectContaining({ coverUrl: null }));
  });
});

// ────────────────────────────────────────────────────────────────────────────
// VALIDATION ERRORS — 400
// ────────────────────────────────────────────────────────────────────────────

describe('POST /api/books — validation errors (400)', () => {
  it('returns 400 VALIDATION_ERROR when title is missing', async () => {
    const { title: _t, ...payload } = VALID_PAYLOAD;
    const res = await request(app).post('/api/books').send(payload).expect(400);

    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(mockCreateBook).not.toHaveBeenCalled();
  });

  it('returns 400 VALIDATION_ERROR when author is missing', async () => {
    const { author: _a, ...payload } = VALID_PAYLOAD;
    const res = await request(app).post('/api/books').send(payload).expect(400);

    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(mockCreateBook).not.toHaveBeenCalled();
  });

  it('returns 400 VALIDATION_ERROR when publishedYear (year) is missing', async () => {
    const { year: _y, ...payload } = VALID_PAYLOAD;
    const res = await request(app).post('/api/books').send(payload).expect(400);

    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(mockCreateBook).not.toHaveBeenCalled();
  });

  it('returns 400 VALIDATION_ERROR when genre is missing', async () => {
    const { genre: _g, ...payload } = VALID_PAYLOAD;
    const res = await request(app).post('/api/books').send(payload).expect(400);

    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(mockCreateBook).not.toHaveBeenCalled();
  });

  it('returns 400 when title is an empty string', async () => {
    const res = await request(app)
      .post('/api/books')
      .send({ ...VALID_PAYLOAD, title: '' })
      .expect(400);

    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when author is an empty string', async () => {
    const res = await request(app)
      .post('/api/books')
      .send({ ...VALID_PAYLOAD, author: '' })
      .expect(400);

    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when title exceeds 200 characters', async () => {
    const res = await request(app)
      .post('/api/books')
      .send({ ...VALID_PAYLOAD, title: 'A'.repeat(201) })
      .expect(400);

    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when year is below the minimum (999)', async () => {
    const res = await request(app)
      .post('/api/books')
      .send({ ...VALID_PAYLOAD, year: 999 })
      .expect(400);

    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when year is above the current year', async () => {
    const futureYear = new Date().getFullYear() + 1;
    const res = await request(app)
      .post('/api/books')
      .send({ ...VALID_PAYLOAD, year: futureYear })
      .expect(400);

    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when year is a non-integer float', async () => {
    const res = await request(app)
      .post('/api/books')
      .send({ ...VALID_PAYLOAD, year: 2019.5 })
      .expect(400);

    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when coverUrl is not a valid URL', async () => {
    const res = await request(app)
      .post('/api/books')
      .send({ ...VALID_PAYLOAD, coverUrl: 'not-a-url' })
      .expect(400);

    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 with validation details in the response body', async () => {
    const res = await request(app).post('/api/books').send({}).expect(400);

    expect(res.body.error).toMatchObject({
      code: 'VALIDATION_ERROR',
      message: expect.any(String),
      details: expect.any(Object),
    });
  });

  it('returns 400 for a completely empty body', async () => {
    const res = await request(app)
      .post('/api/books')
      .set('Content-Type', 'application/json')
      .send({})
      .expect(400);

    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(mockCreateBook).not.toHaveBeenCalled();
  });
});

// ────────────────────────────────────────────────────────────────────────────
// UNEXPECTED ERRORS — 500
// ────────────────────────────────────────────────────────────────────────────

describe('POST /api/books — unexpected errors (500)', () => {
  it('returns 500 INTERNAL_ERROR when bookService.createBook throws an unknown error', async () => {
    mockCreateBook.mockImplementation(() => {
      throw new Error('Database connection lost');
    });

    const res = await request(app).post('/api/books').send(VALID_PAYLOAD).expect(500);

    expect(res.body.error.code).toBe('INTERNAL_ERROR');
    expect(res.body.error.message).toBe('An unexpected error occurred');
  });

  it('returns 500 when bookService.createBook throws a non-Error object', async () => {
    mockCreateBook.mockImplementation(() => {
      throw 'something went very wrong';
    });

    const res = await request(app).post('/api/books').send(VALID_PAYLOAD).expect(500);

    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('does not leak internal error details to the response', async () => {
    mockCreateBook.mockImplementation(() => {
      throw new Error('secret DB password is hunter2');
    });

    const res = await request(app).post('/api/books').send(VALID_PAYLOAD).expect(500);

    expect(JSON.stringify(res.body)).not.toContain('hunter2');
  });
});

// ────────────────────────────────────────────────────────────────────────────
// EDGE CASES
// ────────────────────────────────────────────────────────────────────────────

describe('POST /api/books — edge cases', () => {
  it('strips unrecognised fields from the body before calling createBook', async () => {
    mockCreateBook.mockReturnValue(MOCK_BOOK);

    await request(app)
      .post('/api/books')
      .send({ ...VALID_PAYLOAD, __proto__: {}, injected: true })
      .expect(201);

    const callArg = mockCreateBook.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(callArg).not.toHaveProperty('injected');
  });

  it('returns 201 for a title and author at the maximum allowed length', async () => {
    const payload = {
      title: 'A'.repeat(200),
      author: 'B'.repeat(100),
      genre: 'Fiction',
      year: 2000,
    };
    mockCreateBook.mockReturnValue({ id: '01HWZEDGE000', ...payload, addedAt: '2024-01-01T00:00:00.000Z' });

    await request(app).post('/api/books').send(payload).expect(201);
  });

  it('accepts the minimum valid year (1000)', async () => {
    const payload = { ...VALID_PAYLOAD, year: 1000 };
    mockCreateBook.mockReturnValue({ id: '01HWZEDGE001', ...payload, addedAt: '2024-01-01T00:00:00.000Z' });

    await request(app).post('/api/books').send(payload).expect(201);
  });

  it('returns 400 when year is a string instead of a number', async () => {
    const res = await request(app)
      .post('/api/books')
      .send({ ...VALID_PAYLOAD, year: '2019' })
      .expect(400);

    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when the request body is not JSON', async () => {
    const res = await request(app)
      .post('/api/books')
      .set('Content-Type', 'text/plain')
      .send('title=foo&author=bar')
      .expect(400);

    expect(mockCreateBook).not.toHaveBeenCalled();
  });
});
