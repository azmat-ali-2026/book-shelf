import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shelvesApi } from '../api/shelves';
import { booksApi } from '../api/books';
import type { Book } from '../types';
import { queryKeys } from './queryKeys';

export const useShelvesQuery = (userId?: string) =>
  useQuery({
    queryKey: queryKeys.shelves.list(userId),
    queryFn: () => shelvesApi.list(userId),
  });

export const useShelfBooksQuery = (shelfId: string, bookIds: string[]) =>
  useQuery({
    queryKey: queryKeys.shelves.books(shelfId, bookIds),
    queryFn: () =>
      Promise.all(
        bookIds.map((id) =>
          booksApi
            .getById(id)
            .then((r) => r.book)
            .catch(() => null),
        ),
      ).then((books) => books.filter((b): b is Book => b !== null)),
    enabled: bookIds.length > 0,
  });

export const useCreateShelfMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: shelvesApi.create,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.shelves.all });
    },
  });
};

export const useAddBookToShelfMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ shelfId, bookId }: { shelfId: string; bookId: string }) =>
      shelvesApi.addBook(shelfId, bookId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.shelves.all });
    },
  });
};

export const useRemoveBookFromShelfMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ shelfId, bookId }: { shelfId: string; bookId: string }) =>
      shelvesApi.removeBook(shelfId, bookId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.shelves.all });
    },
  });
};
