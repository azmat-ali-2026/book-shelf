import type { Shelf } from '@bookshelf/shared';
import { api } from './client';

export const shelvesApi = {
  list: (userId?: string) => {
    const qs = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    return api.get<Shelf[]>(`/shelves${qs}`);
  },
  create: (dto: { userId: string; name: string }) =>
    api.post<Shelf>('/shelves', dto),
  addBook: (shelfId: string, bookId: string) =>
    api.post<Shelf>(`/shelves/${shelfId}/books`, { bookId }),
  removeBook: (shelfId: string, bookId: string) =>
    api.del<Shelf>(`/shelves/${shelfId}/books/${bookId}`),
};
