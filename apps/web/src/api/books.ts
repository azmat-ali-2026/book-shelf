import type { Book, Review } from '@bookshelf/shared';
import { api } from './client';

export interface BookWithReviews {
  book: Book;
  reviews: Review[];
}

export const booksApi = {
  list(params?: { genre?: string; year?: number }) {
    const q = new URLSearchParams();
    if (params?.genre) q.set('genre', params.genre);
    if (params?.year !== undefined) q.set('year', String(params.year));
    const qs = q.toString();
    return api.get<Book[]>(`/books${qs ? `?${qs}` : ''}`);
  },
  search: (q: string) =>
    api.get<Book[]>(`/books/search?q=${encodeURIComponent(q)}`),
  getById: (id: string) => api.get<BookWithReviews>(`/books/${id}`),
  create: (dto: Omit<Book, 'id' | 'addedAt'>) => api.post<Book>('/books', dto),
  update: (id: string, dto: Partial<Omit<Book, 'id' | 'addedAt'>>) =>
    api.put<Book>(`/books/${id}`, dto),
  delete: (id: string) => api.del(`/books/${id}`),
};
