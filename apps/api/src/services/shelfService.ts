import { ulid } from 'ulid';
import { Book, Shelf, nowIso } from '@bookshelf/shared';
import { getShelfStore, getBookStore } from '../data';
import { NotFoundError, ConflictError } from '../errors/HttpErrors';

export interface ShelfWithBooks {
  shelf: Shelf;
  books: Book[];
}

export interface CreateShelfDto {
  userId: string;
  name: string;
}

export const shelfService = {
  listShelves(userId?: string): Shelf[] {
    const shelves = getShelfStore().getAll();
    if (userId !== undefined) {
      return shelves.filter((s) => s.userId === userId);
    }
    return shelves;
  },

  createShelf(dto: CreateShelfDto): Shelf {
    const shelf: Shelf = {
      id: ulid(),
      userId: dto.userId,
      name: dto.name,
      bookIds: [],
      createdAt: nowIso(),
    };
    return getShelfStore().save(shelf);
  },

  addBookToShelf(shelfId: string, bookId: string): Shelf {
    const shelf = getShelfStore().getById(shelfId);
    if (!shelf) throw new NotFoundError(`Shelf '${shelfId}' not found`);

    const book = getBookStore().getById(bookId);
    if (!book) throw new NotFoundError(`Book '${bookId}' not found`);

    if (shelf.bookIds.includes(bookId)) {
      throw new ConflictError(`Book '${bookId}' is already on this shelf`);
    }

    return getShelfStore().save({ ...shelf, bookIds: [...shelf.bookIds, bookId] });
  },

  getShelfWithBooks(id: string): ShelfWithBooks {
    const shelf = getShelfStore().getById(id);
    if (!shelf) throw new NotFoundError(`Shelf '${id}' not found`);
    const bookStore = getBookStore();
    const books = shelf.bookIds.flatMap((bid) => {
      const book = bookStore.getById(bid);
      return book !== undefined ? [book] : [];
    });
    return { shelf, books };
  },

  deleteShelf(id: string): void {
    const shelf = getShelfStore().getById(id);
    if (!shelf) throw new NotFoundError(`Shelf '${id}' not found`);
    getShelfStore().delete(id);
  },

  removeBookFromShelf(shelfId: string, bookId: string): Shelf {
    const shelf = getShelfStore().getById(shelfId);
    if (!shelf) throw new NotFoundError(`Shelf '${shelfId}' not found`);

    if (!shelf.bookIds.includes(bookId)) {
      throw new NotFoundError(`Book '${bookId}' is not on this shelf`);
    }

    return getShelfStore().save({
      ...shelf,
      bookIds: shelf.bookIds.filter((id) => id !== bookId),
    });
  },
};
