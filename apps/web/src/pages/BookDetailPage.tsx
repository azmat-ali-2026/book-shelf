import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { Book, Shelf } from '@bookshelf/shared';
import { booksApi, type BookWithReviews } from '../api/books';
import { shelvesApi } from '../api/shelves';
import { reviewsApi } from '../api/reviews';
import StarRating from '../components/StarRating';
import BookForm from '../components/BookForm';

const USER_ID = 'user_1';

const GENRE_COLORS: Record<string, string> = {
  Technology: '#3b82f6',
  Fiction: '#8b5cf6',
  Science: '#22c55e',
  'Non-Fiction': '#f59e0b',
  Philosophy: '#6366f1',
  History: '#f97316',
};

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<BookWithReviews | null>(null);
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showShelfPicker, setShowShelfPicker] = useState(false);
  const [shelfMsg, setShelfMsg] = useState('');

  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([booksApi.getById(id), shelvesApi.list(USER_ID)])
      .then(([bookData, userShelves]) => {
        setData(bookData);
        setShelves(userShelves);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Delete this book? This also removes it from shelves and deletes all reviews.')) return;
    await booksApi.delete(id!);
    navigate('/books');
  };

  const handleBookSaved = (updated: Book) => {
    setData((prev) => (prev ? { ...prev, book: updated } : prev));
    setShowEditForm(false);
  };

  const handleAddToShelf = async (shelfId: string, shelfName: string) => {
    try {
      await shelvesApi.addBook(shelfId, id!);
      setShelfMsg(`Added to "${shelfName}"`);
      setShowShelfPicker(false);
      setTimeout(() => setShelfMsg(''), 3000);
    } catch (err: unknown) {
      setShelfMsg(err instanceof Error ? err.message : 'Failed to add');
      setTimeout(() => setShelfMsg(''), 3000);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) { alert('Please select a rating.'); return; }
    setSubmittingReview(true);
    try {
      const review = await reviewsApi.create(id!, {
        userId: USER_ID,
        rating,
        ...(reviewText.trim() ? { text: reviewText.trim() } : {}),
      });
      setData((prev) => prev ? { ...prev, reviews: [...prev.reviews, review] } : prev);
      setRating(0);
      setReviewText('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div className="state-center">Loading…</div>;
  if (!data) return <div className="state-center">Book not found. <Link to="/books">← Back</Link></div>;

  const { book, reviews } = data;
  const color = GENRE_COLORS[book.genre] ?? '#64748b';
  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  return (
    <div>
      <Link to="/books" className="back-link">← Back to Books</Link>

      <div className="detail-header card">
        <div className="detail-cover" style={{ background: `linear-gradient(135deg, ${color}, ${color}88)` }}>
          📖
        </div>
        <div className="detail-meta">
          <div className="detail-badges">
            <span className="badge" style={{ background: `${color}22`, color }}>{book.genre}</span>
            <span className="text-muted">{book.year}</span>
            {book.isbn && <span className="text-xs text-muted">ISBN {book.isbn}</span>}
          </div>
          <h1 className="detail-title">{book.title}</h1>
          <p className="detail-author">by {book.author}</p>
          {reviews.length > 0 && (
            <div className="detail-rating">
              <StarRating value={Math.round(avgRating)} readonly size="sm" />
              <span className="text-muted text-sm">{avgRating.toFixed(1)} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
            </div>
          )}
          {book.description && <p className="detail-description">{book.description}</p>}
          <div className="detail-actions">
            <div className="shelf-picker-wrap">
              <button className="btn btn-outline" onClick={() => setShowShelfPicker((v) => !v)}>
                + Add to Shelf
              </button>
              {showShelfPicker && (
                <div className="shelf-dropdown">
                  {shelves.length === 0 ? (
                    <p className="shelf-dropdown-empty">
                      No shelves yet. <Link to="/shelves">Create one →</Link>
                    </p>
                  ) : (
                    shelves.map((shelf) => (
                      <button
                        key={shelf.id}
                        className="shelf-dropdown-item"
                        onClick={() => handleAddToShelf(shelf.id, shelf.name)}
                      >
                        {shelf.name}
                        <span className="text-muted text-xs">{shelf.bookIds.length} books</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            <button className="btn btn-ghost" onClick={() => setShowEditForm(true)}>Edit</button>
            <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
          </div>
          {shelfMsg && <p className="shelf-msg">{shelfMsg}</p>}
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 className="section-title">Reviews ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <p className="text-muted">No reviews yet. Be the first!</p>
        ) : (
          <div className="reviews-list">
            {reviews.map((review) => (
              <div key={review.id} className="review">
                <div className="review-meta">
                  <StarRating value={review.rating} readonly size="sm" />
                  <span className="review-user">{review.userId}</span>
                  <span className="text-muted text-xs">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                {review.text && <p className="review-text">{review.text}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="section-title">Write a Review</h2>
        <form onSubmit={handleSubmitReview} className="form-stack">
          <div className="form-group">
            <label className="form-label">Rating *</label>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <div className="form-group">
            <label className="form-label">Review (optional)</label>
            <textarea
              className="form-input"
              rows={3}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your thoughts…"
              style={{ resize: 'vertical' }}
            />
          </div>
          <div>
            <button type="submit" className="btn btn-primary" disabled={submittingReview}>
              {submittingReview ? 'Submitting…' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>

      {showEditForm && <BookForm book={book} onSave={handleBookSaved} onClose={() => setShowEditForm(false)} />}
    </div>
  );
}
