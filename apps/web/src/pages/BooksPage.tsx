import { useState, useEffect, useCallback } from 'react';
import type { Book } from '../types';
import { booksApi } from '../api/books';
import { BookCard } from '../components/BookCard';
import { Modal } from '../components/Modal';
import { BookForm } from '../components/BookForm';
import { EmptyState } from '../components/EmptyState';
import { ErrorMessage } from '../components/ErrorMessage';
import { FullPageSpinner } from '../components/Spinner';
import { GENRES } from '../constants';

const YEAR_OPTIONS = Array.from(
  { length: new Date().getFullYear() - 1899 },
  (_, i) => new Date().getFullYear() - i,
);

export function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [year, setYear] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      let data: Book[];
      if (debouncedSearch.trim()) {
        data = await booksApi.search(debouncedSearch.trim());
      } else {
        data = await booksApi.list({
          genre: genre || undefined,
          year: year ? Number(year) : undefined,
        });
      }
      setBooks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load books');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, genre, year]);

  useEffect(() => { void load(); }, [load]);

  async function handleCreate(data: Omit<Book, 'id' | 'addedAt'>) {
    const book = await booksApi.create(data);
    setShowAdd(false);
    setBooks((prev) => [book, ...prev]);
  }

  const isFiltered = !!debouncedSearch || !!genre || !!year;

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Browse Books</h1>
          <p className="mt-1 text-sm text-gray-500">
            {loading ? 'Loading…' : `${books.length} book${books.length !== 1 ? 's' : ''}`}
            {isFiltered && !loading && ' matching filters'}
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Book
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, author, or genre…"
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition hover:border-gray-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <select
          value={genre}
          onChange={(e) => { setGenre(e.target.value); setSearch(''); }}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 shadow-sm transition hover:border-gray-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="Filter by genre"
        >
          <option value="">All genres</option>
          {GENRES.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>

        <select
          value={year}
          onChange={(e) => { setYear(e.target.value); setSearch(''); }}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 shadow-sm transition hover:border-gray-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="Filter by year"
        >
          <option value="">All years</option>
          {YEAR_OPTIONS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        {isFiltered && (
          <button
            onClick={() => { setSearch(''); setGenre(''); setYear(''); }}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-600 shadow-sm transition hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Clear
          </button>
        )}
      </div>

      {loading && <FullPageSpinner />}

      {!loading && error && (
        <ErrorMessage message={error} onRetry={load} />
      )}

      {!loading && !error && books.length === 0 && (
        <EmptyState
          icon="🔍"
          title={isFiltered ? 'No books found' : 'No books yet'}
          description={
            isFiltered
              ? 'Try adjusting your search or filters'
              : 'Add the first book to your collection'
          }
          action={
            !isFiltered ? (
              <button
                onClick={() => setShowAdd(true)}
                className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
              >
                Add a Book
              </button>
            ) : undefined
          }
        />
      )}

      {!loading && !error && books.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}

      <Modal open={showAdd} title="Add a Book" onClose={() => setShowAdd(false)} maxWidth="max-w-xl">
        <BookForm onSubmit={handleCreate} onCancel={() => setShowAdd(false)} submitLabel="Add Book" />
      </Modal>
    </>
  );
}
