import { ulid } from 'ulid';
import { Book, nowIso } from '@bookshelf/shared';
import { getBookStore, getShelfStore, getReviewStore, genreIndex } from '../data';
import { NotFoundError } from '../errors/HttpErrors';

export type CreateBookDto = Omit<Book, 'id' | 'addedAt'>;
export type UpdateBookDto = Partial<Omit<Book, 'id' | 'addedAt'>>;

export interface ListBooksFilters {
  genre?: string;
  year?: number;
}

function getGenreIndex() {
  if (genreIndex.isStale()) {
    genreIndex.rebuild(getBookStore().getAll());
  }
  return genreIndex;
}

export const bookService = {
  listBooks(filters: ListBooksFilters = {}) {
    let books: Book[];

    if (filters.genre !== undefined) {
      // O(g) over distinct genres, not O(n) over all books
      books = getGenreIndex().match(filters.genre);
    } else {
      books = getBookStore().getAll();
    }

    if (filters.year !== undefined) {
      books = books.filter((b) => b.year === filters.year);
    }

    return books;
  },

  getBookWithReviews(id: string) {
    const book = getBookStore().getById(id);
    if (!book) throw new NotFoundError(`Book '${id}' not found`);
    const reviews = getReviewStore()
      .getAll()
      .filter((r) => r.bookId === id);
    return { book, reviews };
  },

  getShelvesForBook(id: string) {
    const book = getBookStore().getById(id);
    if (!book) throw new NotFoundError(`Book '${id}' not found`);
    return getShelfStore()
      .getAll()
      .filter((s) => s.bookIds.includes(id));
  },

  createBook(dto: CreateBookDto): Book {
    const book: Book = {
      ...dto,
      id: ulid(),
      addedAt: nowIso(),
    };
    const saved = getBookStore().save(book);
    genreIndex.invalidate();
    return saved;
  },

  updateBook(id: string, dto: UpdateBookDto): Book {
    const existing = getBookStore().getById(id);
    if (!existing) throw new NotFoundError(`Book '${id}' not found`);
    const updated: Book = { ...existing, ...dto, id: existing.id, addedAt: existing.addedAt };
    const saved = getBookStore().save(updated);
    genreIndex.invalidate();
    return saved;
  },

  deleteBook(id: string): void {
    const exists = getBookStore().getById(id);
    if (!exists) throw new NotFoundError(`Book '${id}' not found`);

    getBookStore().delete(id);
    genreIndex.invalidate();

    // Cascade: remove bookId from all shelves
    const shelfStore = getShelfStore();
    shelfStore
      .getAll()
      .filter((s) => s.bookIds.includes(id))
      .forEach((s) => {
        shelfStore.save({ ...s, bookIds: s.bookIds.filter((bid) => bid !== id) });
      });

    // Cascade: delete all reviews for this book
    const reviewStore = getReviewStore();
    reviewStore
      .getAll()
      .filter((r) => r.bookId === id)
      .forEach((r) => reviewStore.delete(r.id));
  },

  searchBooks(q: string): Book[] {
    const term = q.toLowerCase();
    return getBookStore()
      .getAll()
      .filter(
        (b) =>
          b.title.toLowerCase().includes(term) ||
          b.author.toLowerCase().includes(term) ||
          b.genre.toLowerCase().includes(term),
      )
      .sort((a, b) => a.title.localeCompare(b.title));
  },
};
