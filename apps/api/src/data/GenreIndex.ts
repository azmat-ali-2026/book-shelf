import { Book } from '@bookshelf/shared';

/**
 * Inverted index: lowercase genre name → books in that genre.
 * Kept in memory, rebuilt lazily when marked stale.
 *
 * Query cost is O(g) over distinct genre keys (typically < 50)
 * rather than O(n) over every book — critical for large catalogues.
 */
export class GenreIndex {
  private index: Map<string, Book[]> = new Map();
  private stale = true;

  invalidate(): void {
    this.stale = true;
  }

  isStale(): boolean {
    return this.stale;
  }

  rebuild(books: Book[]): void {
    this.index.clear();
    for (const book of books) {
      const key = book.genre.toLowerCase();
      const bucket = this.index.get(key);
      if (bucket !== undefined) {
        bucket.push(book);
      } else {
        this.index.set(key, [book]);
      }
    }
    this.stale = false;
  }

  /**
   * Returns all books whose genre contains `term` (case-insensitive).
   * Covers exact, prefix, and partial matches.
   */
  match(term: string): Book[] {
    const normalized = term.toLowerCase();
    const result: Book[] = [];
    for (const [genre, books] of this.index) {
      if (genre.includes(normalized)) {
        result.push(...books);
      }
    }
    return result;
  }
}
