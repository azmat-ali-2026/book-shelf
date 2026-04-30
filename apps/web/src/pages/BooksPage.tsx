import { useState } from 'react';
import type { Book } from '../types';
import { useBooksListQuery, useBookSearchQuery, useCreateBookMutation } from '../hooks/useBooks';
import { useDebounce } from '../hooks/useDebounce';
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

const selectClass =
  'rounded-xl border border-white/7 bg-bg-overlay px-3 py-2.5 font-body text-sm text-text-secondary transition-colors duration-150 hover:border-white/14 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15';

export const BooksPage = () => {
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [year, setYear] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const debouncedSearch = useDebounce(search, 350);
  const isSearching = debouncedSearch.trim().length > 0;

  const listQuery = useBooksListQuery(
    { genre: genre || undefined, year: year ? Number(year) : undefined },
    !isSearching,
  );
  const searchQuery = useBookSearchQuery(debouncedSearch);

  const books = isSearching ? (searchQuery.data ?? []) : (listQuery.data ?? []);
  const isLoading = isSearching ? searchQuery.isLoading : listQuery.isLoading;
  const queryError = isSearching ? searchQuery.error : listQuery.error;
  const refetch = isSearching ? searchQuery.refetch : listQuery.refetch;

  const createMutation = useCreateBookMutation();

  const handleCreate = async (data: Omit<Book, 'id' | 'addedAt'>) => {
    await createMutation.mutateAsync(data);
    setShowAdd(false);
  };

  const isFiltered = isSearching || !!genre || !!year;

  const clearFilters = () => {
    setSearch('');
    setGenre('');
    setYear('');
  };

  return (
    <>
      <div className="relative mb-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(232,164,74,0.07),transparent)]" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-display-lg font-bold text-text-primary">
              Browse Books
            </h1>
            <p className="mt-1 font-body text-sm text-text-muted">
              {isLoading
                ? 'Loading…'
                : `${books.length} book${books.length !== 1 ? 's' : ''}${isFiltered ? ' matching filters' : ''}`}
            </p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 font-body text-sm font-semibold text-text-inverse transition-all duration-150 hover:bg-accent-dim active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-accent/30"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Book
          </button>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, author, or genre…"
            className="w-full rounded-xl border border-white/7 bg-bg-overlay py-2.5 pl-9 pr-4 font-body text-sm text-text-primary placeholder:text-text-muted transition-colors duration-150 hover:border-white/14 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-text-muted transition-colors duration-150 hover:text-text-secondary"
              aria-label="Clear search"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        <select
          value={genre}
          onChange={(e) => {
            setGenre(e.target.value);
            setSearch('');
          }}
          className={selectClass}
          aria-label="Filter by genre"
        >
          <option value="">All genres</option>
          {GENRES.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        <select
          value={year}
          onChange={(e) => {
            setYear(e.target.value);
            setSearch('');
          }}
          className={selectClass}
          aria-label="Filter by year"
        >
          <option value="">All years</option>
          {YEAR_OPTIONS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        {isFiltered && (
          <button
            onClick={clearFilters}
            className="rounded-xl border border-white/7 bg-transparent px-3 py-2.5 font-body text-sm text-text-muted transition-all duration-150 hover:border-white/14 hover:text-text-secondary"
          >
            Clear
          </button>
        )}
      </div>

      {isLoading && <FullPageSpinner />}

      {!isLoading && queryError && (
        <ErrorMessage message={queryError.message} onRetry={() => void refetch()} />
      )}

      {!isLoading && !queryError && books.length === 0 && (
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
                className="rounded-lg bg-accent px-5 py-2.5 font-body text-sm font-semibold text-text-inverse transition-all duration-150 hover:bg-accent-dim active:scale-[0.97]"
              >
                Add a Book
              </button>
            ) : undefined
          }
        />
      )}

      {!isLoading && !queryError && books.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {books.map((book, index) => (
            <div
              key={book.id}
              className="animate-fade-up"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <BookCard book={book} />
            </div>
          ))}
        </div>
      )}

      <Modal open={showAdd} title="Add a Book" onClose={() => setShowAdd(false)} maxWidth="max-w-xl">
        <BookForm
          onSubmit={handleCreate}
          onCancel={() => setShowAdd(false)}
          submitLabel="Add Book"
        />
      </Modal>
    </>
  );
};
