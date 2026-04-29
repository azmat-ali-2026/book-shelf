import { api } from './client';
import type { Book, BookWithReviews, Review } from '../types';

export interface ListBooksParams {
  genre?: string;
  year?: number;
}

export const booksApi = {
  list: (params?: ListBooksParams) => {
    const qs = new URLSearchParams();
    if (params?.genre) qs.set('genre', params.genre);
    if (params?.year) qs.set('year', String(params.year));
    const query = qs.toString();
    return api.get<Book[]>(`/api/books${query ? `?${query}` : ''}`);
  },

  search: (q: string) =>
    api.get<Book[]>(`/api/books/search?q=${encodeURIComponent(q)}`),

  getById: (id: string) => api.get<BookWithReviews>(`/api/books/${id}`),

  create: (data: Omit<Book, 'id' | 'addedAt'>) =>
    api.post<Book>('/api/books', data),

  update: (id: string, data: Partial<Omit<Book, 'id' | 'addedAt'>>) =>
    api.put<Book>(`/api/books/${id}`, data),

  delete: (id: string) => api.delete(`/api/books/${id}`),

  getReviews: (bookId: string) =>
    api.get<Review[]>(`/api/books/${bookId}/reviews`),

  createReview: (
    bookId: string,
    data: { userId: string; rating: number; text?: string },
  ) => api.post<Review>(`/api/books/${bookId}/reviews`, data),
};
