import { Router, RequestHandler } from 'express';
import { shelfService } from '../services/shelfService';
import { validate } from '../middleware/validate';
import { createShelfSchema, addBookToShelfSchema } from './schemas';

const router = Router();

const list: RequestHandler = (req, res, next) => {
  try {
    const userId = typeof req.query['userId'] === 'string' ? req.query['userId'] : undefined;
    res.json({ data: shelfService.listShelves(userId) });
  } catch (err) {
    next(err);
  }
};

const create: RequestHandler = (req, res, next) => {
  try {
    const shelf = shelfService.createShelf(req.body as Parameters<typeof shelfService.createShelf>[0]);
    res.status(201).json({ data: shelf });
  } catch (err) {
    next(err);
  }
};

const addBook: RequestHandler = (req, res, next) => {
  try {
    const shelf = shelfService.addBookToShelf(
      req.params['id'] ?? '',
      (req.body as { bookId: string }).bookId,
    );
    res.json({ data: shelf });
  } catch (err) {
    next(err);
  }
};

const removeBook: RequestHandler = (req, res, next) => {
  try {
    const shelf = shelfService.removeBookFromShelf(
      req.params['id'] ?? '',
      req.params['bookId'] ?? '',
    );
    res.json({ data: shelf });
  } catch (err) {
    next(err);
  }
};

router.get('/', list);
router.post('/', validate(createShelfSchema), create);
router.post('/:id/books', validate(addBookToShelfSchema), addBook);
router.delete('/:id/books/:bookId', removeBook);

export { router as shelvesRouter };
