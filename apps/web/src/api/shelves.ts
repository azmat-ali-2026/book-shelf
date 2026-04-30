import { apiClient } from './client';
import type { Shelf, ApiResponse } from '../types';

export const shelvesApi = {
  list: async (userId?: string): Promise<Shelf[]> => {
    const qs = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    const { data } = await apiClient.get<ApiResponse<Shelf[]>>(`/api/shelves${qs}`);
    return data.data;
  },

  create: async (payload: { userId: string; name: string }): Promise<Shelf> => {
    const { data } = await apiClient.post<ApiResponse<Shelf>>('/api/shelves', payload);
    return data.data;
  },

  addBook: async (shelfId: string, bookId: string): Promise<Shelf> => {
    const { data } = await apiClient.post<ApiResponse<Shelf>>(
      `/api/shelves/${shelfId}/books`,
      { bookId },
    );
    return data.data;
  },

  removeBook: async (shelfId: string, bookId: string): Promise<void> => {
    await apiClient.delete(`/api/shelves/${shelfId}/books/${bookId}`);
  },
};
