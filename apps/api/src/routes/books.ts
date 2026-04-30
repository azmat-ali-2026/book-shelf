import { Router, RequestHandler } from 'express';
import { bookService } from '../services/bookService';
import { reviewService } from '../services/reviewService';
import { validate } from '../middleware/validate';
import {
  createBookSchema,
  updateBookSchema,
  createReviewSchema,
  listBooksQuerySchema,
  updateProgressSchema,
} from './schemas';

const router = Router();

// GET /search must be registered before /:id
const search: RequestHandler = (req, res, next) => {
  try {
    const q = typeof req.query['q'] === 'string' ? req.query['q'] : '';
    res.json({ data: bookService.searchBooks(q) });
  } catch (err) {
    next(err);
  }
};

const list: RequestHandler = (req, res, next) => {
  try {
    const result = listBooksQuerySchema.safeParse(req.query);
    if (!result.success) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid query params' } });
      return;
    }
    res.json({ data: bookService.listBooks(result.data) });
  } catch (err) {
    next(err);
  }
};

const getById: RequestHandler = (req, res, next) => {
  try {
    res.json({ data: bookService.getBookWithReviews(req.params['id'] ?? '') });
  } catch (err) {
    next(err);
  }
};

const create: RequestHandler = (req, res, next) => {
  try {
    const book = bookService.createBook(req.body as Parameters<typeof bookService.createBook>[0]);
    res.status(201).json({ data: book });
  } catch (err) {
    next(err);
  }
};

const update: RequestHandler = (req, res, next) => {
  try {
    res.json({ data: bookService.updateBook(req.params['id'] ?? '', req.body as Parameters<typeof bookService.updateBook>[1]) });
  } catch (err) {
    next(err);
  }
};

const remove: RequestHandler = (req, res, next) => {
  try {
    bookService.deleteBook(req.params['id'] ?? '');
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

const getReviews: RequestHandler = (req, res, next) => {
  try {
    res.json({ data: reviewService.getReviewsForBook(req.params['id'] ?? '') });
  } catch (err) {
    next(err);
  }
};

const createReview: RequestHandler = (req, res, next) => {
  try {
    const review = reviewService.createReview(
      req.params['id'] ?? '',
      req.body as Parameters<typeof reviewService.createReview>[1],
    );
    res.status(201).json({ data: review });
  } catch (err) {
    next(err);
  }
};

const updateProgress: RequestHandler = (req, res, next) => {
  try {
    const result = bookService.updateProgress(
      req.params['id'] ?? '',
      (req.body as { currentPage: number }).currentPage,
    );
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
};

router.get('/search', search);
router.get('/:id/reviews', getReviews);
router.post('/:id/reviews', validate(createReviewSchema), createReview);
router.patch('/:id/progress', validate(updateProgressSchema), updateProgress);
router.get('/:id', getById);
router.put('/:id', validate(updateBookSchema), update);
router.delete('/:id', remove);
router.get('/', list);
router.post('/', validate(createBookSchema), create);

export { router as booksRouter };
