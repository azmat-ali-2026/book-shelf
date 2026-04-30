import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { Book } from '../types';
import {
  useBookDetailQuery,
  useUpdateBookMutation,
  useDeleteBookMutation,
  useCreateReviewMutation,
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
  Technology: 'bg-blue-100 text-blue-700',
  Fiction: 'bg-purple-100 text-purple-700',
  Science: 'bg-green-100 text-green-700',
  'Non-Fiction': 'bg-orange-100 text-orange-700',
  Philosophy: 'bg-pink-100 text-pink-700',
  History: 'bg-amber-100 text-amber-700',
};

export const BookDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [showEdit, setShowEdit] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showShelfPicker, setShowShelfPicker] = useState(false);
  const [shelfMsg, setShelfMsg] = useState('');

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

  const genreClass = genreColors[book.genre] ?? 'bg-gray-100 text-gray-600';

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
        Back to books
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left: cover + actions */}
        <div className="lg:col-span-1">
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
            <div className="aspect-[3/4] w-full">
              {book.coverUrl ? (
                <img
                  src={book.coverUrl}
                  alt={`Cover of ${book.title}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
                  <span className="text-6xl font-bold text-primary-200">
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
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
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
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 text-sm font-semibold text-primary-700 transition hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
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
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
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
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300"
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
          <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <div className="mb-4 flex flex-wrap items-start gap-3">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${genreClass}`}
              >
                {book.genre}
              </span>
              <span className="text-sm text-gray-400">{book.year}</span>
              {book.isbn && (
                <span className="text-xs text-gray-400">ISBN: {book.isbn}</span>
              )}
            </div>

            <h1 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">
              {book.title}
            </h1>
            <p className="mb-4 text-base text-gray-600">{book.author}</p>

            {reviews.length > 0 && (
              <div className="mb-4 flex items-center gap-2">
                <StarRating value={Math.round(avgRating)} readonly size="sm" />
                <span className="text-sm font-medium text-gray-700">
                  {avgRating.toFixed(1)}
                </span>
                <span className="text-sm text-gray-400">
                  ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                </span>
              </div>
            )}

            {book.description && (
              <p className="leading-relaxed text-gray-600">{book.description}</p>
            )}
          </div>

          {/* Reviews */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Reviews{reviews.length > 0 && ` (${reviews.length})`}
              </h2>
              <button
                onClick={() => setShowReview(true)}
                className="text-sm font-medium text-primary-600 transition hover:text-primary-700"
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
                    className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
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

      {/* Edit modal */}
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

      {/* Review modal */}
      <Modal open={showReview} title="Write a Review" onClose={() => setShowReview(false)}>
        <ReviewForm onSubmit={handleReview} onCancel={() => setShowReview(false)} />
      </Modal>

      {/* Delete confirmation */}
      <Modal open={showDelete} title="Delete Book" onClose={() => setShowDelete(false)}>
        <p className="mb-6 text-sm text-gray-600">
          Are you sure you want to delete <strong>{book.title}</strong>? This will also remove
          it from all shelves and delete all its reviews. This action cannot be undone.
        </p>
        {deleteMutation.error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {deleteMutation.error.message}
          </p>
        )}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setShowDelete(false)}
            disabled={deleteMutation.isPending}
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => void handleDelete()}
            disabled={deleteMutation.isPending}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            {deleteMutation.isPending && <Spinner size="sm" />}
            {deleteMutation.isPending ? 'Deleting…' : 'Delete Book'}
          </button>
        </div>
      </Modal>

      {/* Shelf picker modal */}
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
            className={`mb-4 rounded-lg px-3 py-2 text-sm ${
              shelfMsg === 'Added to shelf!'
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-600'
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
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition ${
                    onShelf
                      ? 'cursor-default border-green-200 bg-green-50 text-green-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700'
                  }`}
                >
                  <span className="font-medium">{shelf.name}</span>
                  <span className="flex items-center gap-1.5">
                    {isAdding ? (
                      <Spinner size="sm" />
                    ) : onShelf ? (
                      <svg
                        className="h-4 w-4 text-green-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
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
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    )}
                    <span className="text-xs text-gray-400">
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
