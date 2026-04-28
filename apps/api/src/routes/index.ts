import { Router } from 'express';
import { booksRouter } from './books';
import { shelvesRouter } from './shelves';

const router = Router();

router.use('/books', booksRouter);
router.use('/shelves', shelvesRouter);

export { router };
