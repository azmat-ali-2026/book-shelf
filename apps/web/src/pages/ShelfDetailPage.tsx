import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Shelf, Book } from '../types';
import { shelvesApi } from '../api/shelves';
import { booksApi } from '../api/books';
import { BookCard } from '../components/BookCard';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';
import { ErrorMessage } from '../components/ErrorMessage';
import { FullPageSpinner, Spinner } from '../components/Spinner';

export function ShelfDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [shelf, setShelf] = useState<Shelf | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showAddBook, setShowAddBook] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [searching, setSearching] = useState(false);
  const [addingBook, setAddingBook] = useState<string | null>(null);
  const [addMsg, setAddMsg] = useState('');
  const [removingBook, setRemovingBook] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const allShelves = await shelvesApi.list();
      const found = allShelves.find((s) => s.id === id);
      if (!found) { setError('Shelf not found'); setLoading(false); return; }
      setShelf(found);

      if (found.bookIds.length > 0) {
        const bookList = await Promise.all(
          found.bookIds.map((bookId) =>
            booksApi.getById(bookId).then((r) => r.book).catch(() => null),
          ),
        );
        setBooks(bookList.filter((b): b is Book => b !== null));
      } else {
        setBooks([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load shelf');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await booksApi.search(searchQuery);
        setSearchResults(results.filter((b) => !shelf?.bookIds.includes(b.id)));
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [searchQuery, shelf]);

  async function removeBook(bookId: string) {
    if (!id) return;
    setRemovingBook(bookId);
    try {
      await shelvesApi.removeBook(id, bookId);
      setShelf((prev) =>
        prev ? { ...prev, bookIds: prev.bookIds.filter((b) => b !== bookId) } : null,
      );
      setBooks((prev) => prev.filter((b) => b.id !== bookId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove book');
    } finally {
      setRemovingBook(null);
    }
  }

  async function addBook(bookId: string) {
    if (!id) return;
    setAddingBook(bookId);
    setAddMsg('');
    try {
      const updated = await shelvesApi.addBook(id, bookId);
      setShelf(updated);
      const bookData = await booksApi.getById(bookId);
      setBooks((prev) => [...prev, bookData.book]);
      setSearchResults((prev) => prev.filter((b) => b.id !== bookId));
      setAddMsg(`"${bookData.book.title}" added!`);
    } catch (err) {
      setAddMsg(err instanceof Error ? err.message : 'Failed to add book');
    } finally {
      setAddingBook(null);
    }
  }

  if (loading) return <FullPageSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={load} />;
  if (!shelf) return null;

  return (
    <>
      <Link
        to="/shelves"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 transition hover:text-gray-900"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to shelves
      </Link>

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{shelf.name}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {books.length === 0 ? 'No books yet' : `${books.length} book${books.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={() => { setShowAddBook(true); setAddMsg(''); setSearchQuery(''); setSearchResults([]); }}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Book
        </button>
      </div>

      {books.length === 0 ? (
        <EmptyState
          icon="📖"
          title="Shelf is empty"
          description="Add books to this shelf to keep track of your reading"
          action={
            <button
              onClick={() => setShowAddBook(true)}
              className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
            >
              Add a Book
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              actions={
                <button
                  onClick={() => removeBook(book.id)}
                  disabled={removingBook === book.id}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100 focus:outline-none focus:ring-1 focus:ring-red-400 disabled:opacity-50"
                >
                  {removingBook === book.id ? <Spinner size="sm" /> : null}
                  {removingBook === book.id ? 'Removing…' : 'Remove'}
                </button>
              }
            />
          ))}
        </div>
      )}

      {/* Add book modal */}
      <Modal
        open={showAddBook}
        title="Add Book to Shelf"
        onClose={() => setShowAddBook(false)}
        maxWidth="max-w-lg"
      >
        <div className="relative mb-4">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search books by title, author, or genre…"
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 transition hover:border-gray-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
            autoFocus
          />
        </div>

        {addMsg && (
          <p className={`mb-3 rounded-lg px-3 py-2 text-sm ${
            addMsg.endsWith('added!') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
          }`}>
            {addMsg}
          </p>
        )}

        {searching && (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        )}

        {!searching && searchQuery && searchResults.length === 0 && (
          <p className="py-4 text-center text-sm text-gray-400">No matching books found</p>
        )}

        {!searching && searchResults.length > 0 && (
          <div className="max-h-72 space-y-2 overflow-y-auto">
            {searchResults.map((book) => (
              <button
                key={book.id}
                onClick={() => addBook(book.id)}
                disabled={addingBook === book.id}
                className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-left transition hover:border-primary-200 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-60"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{book.title}</p>
                  <p className="text-xs text-gray-500">{book.author} · {book.year}</p>
                </div>
                {addingBook === book.id ? (
                  <Spinner size="sm" />
                ) : (
                  <svg className="h-4 w-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}

        {!searchQuery && (
          <p className="py-4 text-center text-sm text-gray-400">
            Type to search for a book to add
          </p>
        )}
      </Modal>
    </>
  );
}
