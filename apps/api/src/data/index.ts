import { Book, Shelf, Review } from '@bookshelf/shared';
import { FileStore } from './FileStore';
import { GenreIndex } from './GenreIndex';

let _bookStore: FileStore<Book> | undefined;
let _shelfStore: FileStore<Shelf> | undefined;
let _reviewStore: FileStore<Review> | undefined;

export const genreIndex = new GenreIndex();

export function getBookStore(): FileStore<Book> {
  return (_bookStore ??= new FileStore<Book>('books.json'));
}

export function getShelfStore(): FileStore<Shelf> {
  return (_shelfStore ??= new FileStore<Shelf>('shelves.json'));
}

export function getReviewStore(): FileStore<Review> {
  return (_reviewStore ??= new FileStore<Review>('reviews.json'));
}

export function resetStores(): void {
  _bookStore = undefined;
  _shelfStore = undefined;
  _reviewStore = undefined;
  genreIndex.invalidate();
}
