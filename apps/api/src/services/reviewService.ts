import { ulid } from 'ulid';
import { Review, nowIso } from '@bookshelf/shared';
import { getReviewStore, getBookStore } from '../data';
import { NotFoundError } from '../errors/HttpErrors';

export interface CreateReviewDto {
  userId: string;
  rating: number;
  text?: string;
}

export const reviewService = {
  getReviewsForBook(bookId: string): Review[] {
    const book = getBookStore().getById(bookId);
    if (!book) throw new NotFoundError(`Book '${bookId}' not found`);
    return getReviewStore()
      .getAll()
      .filter((r) => r.bookId === bookId);
  },

  createReview(bookId: string, dto: CreateReviewDto): Review {
    const book = getBookStore().getById(bookId);
    if (!book) throw new NotFoundError(`Book '${bookId}' not found`);

    const review: Review = {
      id: ulid(),
      bookId,
      userId: dto.userId,
      rating: dto.rating as 1 | 2 | 3 | 4 | 5,
      createdAt: nowIso(),
      ...(dto.text !== undefined ? { text: dto.text } : {}),
    };
    return getReviewStore().save(review);
  },
};
