import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { booksApi, type ListBooksParams } from '../api/books';
import type { Book, BookWithReviews } from '../types';
import { queryKeys } from './queryKeys';

export const useBooksListQuery = (params?: ListBooksParams, enabled = true) =>
  useQuery({
    queryKey: queryKeys.books.list(params),
    queryFn: () => booksApi.list(params),
    enabled,
  });

export const useBookSearchQuery = (q: string) =>
  useQuery({
    queryKey: queryKeys.books.search(q),
    queryFn: () => booksApi.search(q),
    enabled: q.trim().length > 0,
  });

export const useBookDetailQuery = (id: string) =>
  useQuery({
    queryKey: queryKeys.books.detail(id),
    queryFn: () => booksApi.getById(id),
    enabled: !!id,
  });

export const useCreateBookMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: booksApi.create,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.books.all });
    },
  });
};

export const useUpdateBookMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Book, 'id' | 'addedAt'>> }) =>
      booksApi.update(id, data),
    onSuccess: (updatedBook) => {
      qc.setQueryData<BookWithReviews>(queryKeys.books.detail(updatedBook.id), (old) =>
        old ? { ...old, book: updatedBook } : old,
      );
      void qc.invalidateQueries({ queryKey: queryKeys.books.all });
    },
  });
};

export const useDeleteBookMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: booksApi.delete,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.books.all });
    },
  });
};

export const useCreateReviewMutation = (bookId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { userId: string; rating: number; text?: string }) =>
      booksApi.createReview(bookId, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.books.detail(bookId) });
    },
  });
};
