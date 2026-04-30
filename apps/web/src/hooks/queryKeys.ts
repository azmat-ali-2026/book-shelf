import type { ListBooksParams } from '../api/books';

export const queryKeys = {
  books: {
    all: ['books'] as const,
    list: (params?: ListBooksParams) => ['books', 'list', params] as const,
    search: (q: string) => ['books', 'search', q] as const,
    detail: (id: string) => ['books', 'detail', id] as const,
  },
  shelves: {
    all: ['shelves'] as const,
    list: (userId?: string) => ['shelves', 'list', userId] as const,
    books: (shelfId: string, bookIds: string[]) =>
      ['shelf-books', shelfId, bookIds] as const,
  },
} as const;
