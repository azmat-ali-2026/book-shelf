import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useShelvesQuery, useShelfBooksQuery, useRemoveBookFromShelfMutation, useAddBookToShelfMutation } from '../hooks/useShelves';
import { useBookSearchQuery } from '../hooks/useBooks';
import { useDebounce } from '../hooks/useDebounce';
import { BookCard } from '../components/BookCard';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';
import { ErrorMessage } from '../components/ErrorMessage';
import { FullPageSpinner, Spinner } from '../components/Spinner';

export const ShelfDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  const [showAddBook, setShowAddBook] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [addMsg, setAddMsg] = useState('');

  const debouncedSearch = useDebounce(searchQuery, 350);

  const shelvesQuery = useShelvesQuery();
  const shelf = shelvesQuery.data?.find((s) => s.id === id);

  const booksQuery = useShelfBooksQuery(id ?? '', shelf?.bookIds ?? []);
  const searchQuery_ = useBookSearchQuery(debouncedSearch);

  const removeMutation = useRemoveBookFromShelfMutation();
  const addMutation = useAddBookToShelfMutation();

  const searchResults = (searchQuery_.data ?? []).filter(
    (b) => !shelf?.bookIds.includes(b.id),
  );

  const handleRemove = (bookId: string) => {
    void removeMutation.mutateAsync({ shelfId: id!, bookId });
  };

  const handleAdd = async (bookId: string) => {
    setAddMsg('');
    try {
      await addMutation.mutateAsync({ shelfId: id!, bookId });
      const addedBook = searchQuery_.data?.find((b) => b.id === bookId);
      setAddMsg(addedBook ? `"${addedBook.title}" added!` : 'Added!');
    } catch (err) {
      setAddMsg(err instanceof Error ? err.message : 'Failed to add book');
    }
  };

  if (shelvesQuery.isLoading) return <FullPageSpinner />;

  if (shelvesQuery.error) {
    return (
      <ErrorMessage
        message={shelvesQuery.error.message}
        onRetry={() => void shelvesQuery.refetch()}
      />
    );
  }

  if (!shelf) {
    return <ErrorMessage message="Shelf not found" />;
  }

  const books = booksQuery.data ?? [];

  return (
    <>
      <Link
        to="/shelves"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 transition hover:text-gray-900"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to shelves
      </Link>

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{shelf.name}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {booksQuery.isLoading
              ? 'Loading…'
              : books.length === 0
                ? 'No books yet'
                : `${books.length} book${books.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={() => {
            setShowAddBook(true);
            setAddMsg('');
            setSearchQuery('');
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
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

      {booksQuery.isLoading && <FullPageSpinner />}

      {!booksQuery.isLoading && books.length === 0 && (
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
      )}

      {!booksQuery.isLoading && books.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              actions={
                <button
                  onClick={() => handleRemove(book.id)}
                  disabled={removeMutation.isPending}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100 focus:outline-none focus:ring-1 focus:ring-red-400 disabled:opacity-50"
                >
                  {removeMutation.isPending && <Spinner size="sm" />}
                  {removeMutation.isPending ? 'Removing…' : 'Remove'}
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
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search books by title, author, or genre…"
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 transition hover:border-gray-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
            autoFocus
          />
        </div>

        {addMsg && (
          <p
            className={`mb-3 rounded-lg px-3 py-2 text-sm ${
              addMsg.endsWith('added!') || addMsg === 'Added!'
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-600'
            }`}
          >
            {addMsg}
          </p>
        )}

        {searchQuery_.isLoading && (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        )}

        {!searchQuery_.isLoading && debouncedSearch && searchResults.length === 0 && (
          <p className="py-4 text-center text-sm text-gray-400">No matching books found</p>
        )}

        {!searchQuery_.isLoading && searchResults.length > 0 && (
          <div className="max-h-72 space-y-2 overflow-y-auto">
            {searchResults.map((book) => (
              <button
                key={book.id}
                onClick={() => void handleAdd(book.id)}
                disabled={addMutation.isPending}
                className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-left transition hover:border-primary-200 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-60"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{book.title}</p>
                  <p className="text-xs text-gray-500">
                    {book.author} · {book.year}
                  </p>
                </div>
                {addMutation.isPending ? (
                  <Spinner size="sm" />
                ) : (
                  <svg
                    className="h-4 w-4 text-primary-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}

        {!debouncedSearch && (
          <p className="py-4 text-center text-sm text-gray-400">
            Type to search for a book to add
          </p>
        )}
      </Modal>
    </>
  );
};
