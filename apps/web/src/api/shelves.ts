import { api } from './client';
import type { Shelf } from '../types';

export const shelvesApi = {
  list: (userId?: string) => {
    const qs = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    return api.get<Shelf[]>(`/api/shelves${qs}`);
  },

  create: (data: { userId: string; name: string }) =>
    api.post<Shelf>('/api/shelves', data),

  addBook: (shelfId: string, bookId: string) =>
    api.post<Shelf>(`/api/shelves/${shelfId}/books`, { bookId }),

  removeBook: (shelfId: string, bookId: string) =>
    api.delete(`/api/shelves/${shelfId}/books/${bookId}`),
};
