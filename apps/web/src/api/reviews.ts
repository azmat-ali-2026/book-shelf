import type { Review } from '@bookshelf/shared';
import { api } from './client';

export const reviewsApi = {
  create: (bookId: string, dto: { userId: string; rating: number; text?: string }) =>
    api.post<Review>(`/books/${bookId}/reviews`, dto),
};
