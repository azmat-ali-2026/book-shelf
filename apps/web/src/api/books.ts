import { apiClient } from './client';
import type { Book, BookWithReviews, Review, ApiResponse } from '../types';

export type ListBooksParams = {
  genre?: string;
  year?: number;
};

export const booksApi = {
  list: async (params?: ListBooksParams): Promise<Book[]> => {
    const qs = new URLSearchParams();
    if (params?.genre) qs.set('genre', params.genre);
    if (params?.year) qs.set('year', String(params.year));
    const query = qs.toString();
    const { data } = await apiClient.get<ApiResponse<Book[]>>(
      `/api/books${query ? `?${query}` : ''}`,
    );
    return data.data;
  },

  search: async (q: string): Promise<Book[]> => {
    const { data } = await apiClient.get<ApiResponse<Book[]>>(
      `/api/books/search?q=${encodeURIComponent(q)}`,
    );
    return data.data;
  },

  getById: async (id: string): Promise<BookWithReviews> => {
    const { data } = await apiClient.get<ApiResponse<BookWithReviews>>(`/api/books/${id}`);
    return data.data;
  },

  create: async (payload: Omit<Book, 'id' | 'addedAt'>): Promise<Book> => {
    const { data } = await apiClient.post<ApiResponse<Book>>('/api/books', payload);
    return data.data;
  },

  update: async (id: string, payload: Partial<Omit<Book, 'id' | 'addedAt'>>): Promise<Book> => {
    const { data } = await apiClient.put<ApiResponse<Book>>(`/api/books/${id}`, payload);
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/books/${id}`);
  },

  getReviews: async (bookId: string): Promise<Review[]> => {
    const { data } = await apiClient.get<ApiResponse<Review[]>>(
      `/api/books/${bookId}/reviews`,
    );
    return data.data;
  },

  createReview: async (
    bookId: string,
    payload: { userId: string; rating: number; text?: string },
  ): Promise<Review> => {
    const { data } = await apiClient.post<ApiResponse<Review>>(
      `/api/books/${bookId}/reviews`,
      payload,
    );
    return data.data;
  },
};
