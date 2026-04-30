import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { Book } from '../types';
import {
  useBookDetailQuery,
  useUpdateBookMutation,
  useDeleteBookMutation,
  useCreateReviewMutation,
  useUpdateProgressMutation,
} from '../hooks/useBooks';
import { useShelvesQuery, useAddBookToShelfMutation } from '../hooks/useShelves';
import { Modal } from '../components/Modal';
import { BookForm } from '../components/BookForm';
import { ReviewForm } from '../components/ReviewForm';
import { ReviewCard } from '../components/ReviewCard';
import { StarRating } from '../components/StarRating';
import { EmptyState } from '../components/EmptyState';
import { ErrorMessage } from '../components/ErrorMessage';
import { FullPageSpinner, Spinner } from '../components/Spinner';
import { DEMO_USER_ID } from '../constants';

const genreColors: Record<string, string> = {
  Technology:    'bg-info/10 text-info border-info/30',
  Fiction:       'bg-accent/10 text-accent border-accent/30',
  Science:       'bg-success/10 text-success border-success/30',
  'Non-Fiction': 'bg-bg-subtle text-text-secondary border-white/7',
  Philosophy:    'bg-error/10 text-error border-error/30',
  History:       'bg-accent/10 text-accent border-accent/30',
};

export const BookDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [showEdit, setShowEdit] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showShelfPicker, setShowShelfPicker] = useState(false);
  const [shelfMsg, setShelfMsg] = useState('');
  const [progressInput, setProgressInput] = useState('');
  const [progressMsg, setProgressMsg] = useState('');
  const progressMutation = useUpdateProgressMutation(id ?? '');

  const bookQuery = useBookDetailQuery(id ?? '');
  const shelvesQuery = useShelvesQuery(DEMO_USER_ID);

  const updateMutation = useUpdateBookMutation();
  const deleteMutation = useDeleteBookMutation();
  const reviewMutation = useCreateReviewMutation(id ?? '');
  const addToShelfMutation = useAddBookToShelfMutation();

  if (bookQuery.isLoading) return <FullPageSpinner />;
  if (bookQuery.error)
    return (
      <ErrorMessage
        message={bookQuery.error.message}
        onRetry={() => void bookQuery.refetch()}
      />
    );
  if (!bookQuery.data) return null;

  const { book, reviews } = bookQuery.data;

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  const genreClass = genreColors[book.genre] ?? 'bg-bg-subtle text-text-secondary border-white/7';

  const handleEdit = async (data: Partial<Omit<Book, 'id' | 'addedAt'>>) => {
    await updateMutation.mutateAsync({ id: id!, data });
    setShowEdit(false);
  };

  const handleReview = async (rating: number, text: string) => {
    await reviewMutation.mutateAsync({
      userId: DEMO_USER_ID,
      rating,
      text: text || undefined,
    });
    setShowReview(false);
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id!);
      navigate('/');
    } catch {
      // error shown via deleteMutation.error below
    }
  };

  const handleProgress = async () => {
    const page = parseInt(progressInput, 10);
    if (isNaN(page) || page < 1) return;
    setProgressMsg('');
    try {
      await progressMutation.mutateAsync(page);
      setProgressInput('');
      setProgressMsg('Progress saved!');
    } catch (err) {
      setProgressMsg(err instanceof Error ? err.message : 'Failed to save progress');
    }
  };

  const handleAddToShelf = async (shelfId: string) => {
    setShelfMsg('');
    try {
      await addToShelfMutation.mutateAsync({ shelfId, bookId: id! });
      setShelfMsg('Added to shelf!');
    } catch (err) {
      setShelfMsg(err instanceof Error ? err.message : 'Failed to add to shelf');
    }
  };

  return (
    <>
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1.5 font-body text-sm text-text-muted transition-colors duration-150 hover:text-text-primary"
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
        Back to books
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left: cover + actions */}
        <div className="lg:col-span-1">
          <div className="overflow-hidden rounded-2xl border border-white/7 bg-bg-raised">
            <div className="aspect-[3/4] w-full">
              {book.coverUrl ? (
                <img
                  src={book.coverUrl}
                  alt={`Cover of ${book.title}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-bg-overlay">
                  <span className="font-display text-6xl font-bold text-text-muted">
                    {book.title.slice(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <button
              onClick={() => {
                setShowShelfPicker(true);
                setShelfMsg('');
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 font-body text-sm font-semibold text-text-inverse transition-all duration-150 hover:bg-accent-dim active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
              Add to Shelf
            </button>

            <button
              onClick={() => setShowReview(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/7 bg-transparent px-4 py-3 font-body text-sm font-semibold text-text-secondary transition-all duration-150 hover:border-white/14 hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/20"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
              Write a Review
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => setShowEdit(true)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/7 bg-transparent px-4 py-2.5 font-body text-sm font-medium text-text-muted transition-all duration-150 hover:border-white/14 hover:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent/20"
              >
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit
              </button>
              <button
                onClick={() => setShowDelete(true)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-error/30 bg-error/10 px-4 py-2.5 font-body text-sm font-medium text-error transition-all duration-150 hover:bg-error/15 focus:outline-none focus:ring-2 focus:ring-error/30"
              >
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Right: details + reviews */}
        <div className="lg:col-span-2">
          <div className="mb-6 rounded-2xl border border-white/7 bg-bg-raised p-6">
            <div className="mb-4 flex flex-wrap items-start gap-3">
              <span
                className={`inline-flex items-center rounded border px-2 py-0.5 font-body text-xs font-semibold tracking-widest uppercase ${genreClass}`}
              >
                {book.genre}
              </span>
              <span className="font-mono text-sm text-text-muted">{book.year}</span>
              {book.isbn && (
                <span className="font-mono text-xs text-text-muted">ISBN: {book.isbn}</span>
              )}
            </div>

            <h1 className="mb-2 font-display text-display-md font-bold text-text-primary sm:text-display-lg">
              {book.title}
            </h1>
            <p className="mb-4 font-body text-base text-text-secondary">{book.author}</p>

            {reviews.length > 0 && (
              <div className="mb-4 flex items-center gap-2">
                <StarRating value={Math.round(avgRating)} readonly size="sm" />
                <span className="font-body text-sm font-medium text-text-primary">
                  {avgRating.toFixed(1)}
                </span>
                <span className="font-body text-sm text-text-muted">
                  ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                </span>
              </div>
            )}

            {book.description && (
              <p className="font-body leading-relaxed text-text-secondary">{book.description}</p>
            )}
          </div>

          {/* Reading Progress */}
          <div className="mb-6 rounded-2xl border border-white/7 bg-bg-raised p-6">
            <h2 className="mb-4 font-display text-display-sm font-semibold text-text-primary">
              Reading Progress
            </h2>

            {book.currentPage !== undefined && (
              <div className="mb-4">
                <div className="mb-1.5 flex justify-between font-body text-sm text-text-secondary">
                  <span>Page {book.currentPage}{book.pages ? ` of ${book.pages}` : ''}</span>
                  {book.pages && book.pages > 0 && (
                    <span>{Math.round((book.currentPage / book.pages) * 100)}%</span>
                  )}
                </div>
                {book.pages && book.pages > 0 && (
                  <div className="h-2 w-full overflow-hidden rounded-full bg-bg-overlay">
                    <div
                      className="h-full rounded-full bg-accent transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.round((book.currentPage / book.pages) * 100))}%` }}
                    />
                  </div>
                )}
              </div>
            )}

            {progressMsg && (
              <p className={`mb-3 rounded-lg border px-3 py-2 font-body text-sm ${
                progressMsg === 'Progress saved!'
                  ? 'border-success/30 bg-success/10 text-success'
                  : 'border-error/30 bg-error/10 text-error'
              }`}>
                {progressMsg}
              </p>
            )}

            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                max={book.pages ?? undefined}
                value={progressInput}
                onChange={(e) => setProgressInput(e.target.value)}
                placeholder={book.currentPage !== undefined ? `Currently on page ${book.currentPage}` : 'Enter current page…'}
                className="flex-1 rounded-xl border border-white/7 bg-bg-overlay px-3 py-2.5 font-body text-sm text-text-primary placeholder-text-muted focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
              <button
                onClick={() => void handleProgress()}
                disabled={progressMutation.isPending || !progressInput}
                className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 font-body text-sm font-semibold text-text-inverse transition-all duration-150 hover:bg-accent-dim active:scale-[0.97] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-accent/30"
              >
                {progressMutation.isPending && (
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                )}
                Update
              </button>
            </div>
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-display-sm font-semibold text-text-primary">
                Reviews{reviews.length > 0 && ` (${reviews.length})`}
              </h2>
              <button
                onClick={() => setShowReview(true)}
                className="font-body text-sm font-medium text-accent transition-colors duration-150 hover:text-accent-dim"
              >
                + Write one
              </button>
            </div>

            {reviews.length === 0 ? (
              <EmptyState
                icon="💬"
                title="No reviews yet"
                description="Be the first to share your thoughts"
                action={
                  <button
                    onClick={() => setShowReview(true)}
                    className="rounded-lg bg-accent px-5 py-2.5 font-body text-sm font-semibold text-text-inverse transition-all duration-150 hover:bg-accent-dim active:scale-[0.97]"
                  >
                    Write a Review
                  </button>
                }
              />
            ) : (
              <div className="space-y-3">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        open={showEdit}
        title="Edit Book"
        onClose={() => setShowEdit(false)}
        maxWidth="max-w-xl"
      >
        <BookForm
          initial={book}
          onSubmit={handleEdit}
          onCancel={() => setShowEdit(false)}
          submitLabel="Save Changes"
        />
      </Modal>

      <Modal open={showReview} title="Write a Review" onClose={() => setShowReview(false)}>
        <ReviewForm onSubmit={handleReview} onCancel={() => setShowReview(false)} />
      </Modal>

      <Modal open={showDelete} title="Delete Book" onClose={() => setShowDelete(false)}>
        <p className="mb-6 font-body text-sm text-text-secondary">
          Are you sure you want to delete{' '}
          <strong className="text-text-primary">{book.title}</strong>? This will also remove it
          from all shelves and delete all its reviews. This action cannot be undone.
        </p>
        {deleteMutation.error && (
          <p className="mb-4 rounded-lg border border-error/30 bg-error/10 px-3 py-2 font-body text-sm text-error">
            {deleteMutation.error.message}
          </p>
        )}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setShowDelete(false)}
            disabled={deleteMutation.isPending}
            className="rounded-lg border border-white/7 bg-transparent px-4 py-2.5 font-body text-sm font-medium text-text-secondary transition-all duration-150 hover:border-white/14 hover:text-text-primary disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => void handleDelete()}
            disabled={deleteMutation.isPending}
            className="flex items-center gap-2 rounded-lg bg-error px-5 py-2.5 font-body text-sm font-semibold text-text-inverse transition-all duration-150 hover:opacity-90 active:scale-[0.97] disabled:opacity-60"
          >
            {deleteMutation.isPending && <Spinner size="sm" />}
            {deleteMutation.isPending ? 'Deleting…' : 'Delete Book'}
          </button>
        </div>
      </Modal>

      <Modal
        open={showShelfPicker}
        title="Add to Shelf"
        onClose={() => {
          setShowShelfPicker(false);
          setShelfMsg('');
        }}
      >
        {shelvesQuery.isLoading && (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        )}

        {shelfMsg && (
          <p
            className={`mb-4 rounded-lg border px-3 py-2 font-body text-sm ${
              shelfMsg === 'Added to shelf!'
                ? 'border-success/30 bg-success/10 text-success'
                : 'border-error/30 bg-error/10 text-error'
            }`}
          >
            {shelfMsg}
          </p>
        )}

        {!shelvesQuery.isLoading && (shelvesQuery.data ?? []).length === 0 && (
          <EmptyState
            icon="🗂️"
            title="No shelves yet"
            description="Create a shelf first from the My Shelves page"
          />
        )}

        {!shelvesQuery.isLoading && (shelvesQuery.data ?? []).length > 0 && (
          <div className="space-y-2">
            {(shelvesQuery.data ?? []).map((shelf) => {
              const onShelf = shelf.bookIds.includes(id!);
              const isAdding = addToShelfMutation.isPending;
              return (
                <button
                  key={shelf.id}
                  onClick={() => !onShelf && void handleAddToShelf(shelf.id)}
                  disabled={onShelf || isAdding}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left font-body text-sm transition-all duration-150 ${
                    onShelf
                      ? 'cursor-default border-success/30 bg-success/10 text-success'
                      : 'border-white/7 bg-bg-overlay text-text-secondary hover:border-white/14 hover:text-text-primary'
                  }`}
                >
                  <span className="font-medium">{shelf.name}</span>
                  <span className="flex items-center gap-1.5">
                    {isAdding ? (
                      <Spinner size="sm" />
                    ) : onShelf ? (
                      <svg
                        className="h-4 w-4 text-success"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    )}
                    <span className="text-xs text-text-muted">
                      {onShelf ? 'On shelf' : `${shelf.bookIds.length} books`}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </Modal>
    </>
  );
};
