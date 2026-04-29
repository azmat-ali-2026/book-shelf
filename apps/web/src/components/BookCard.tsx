import { Link } from 'react-router-dom';
import type { Book } from '@bookshelf/shared';

const GENRE_COLORS: Record<string, string> = {
  Technology: '#3b82f6',
  Fiction: '#8b5cf6',
  Science: '#22c55e',
  'Non-Fiction': '#f59e0b',
  Philosophy: '#6366f1',
  History: '#f97316',
};

interface Props {
  book: Book;
  onDelete?: (id: string) => void;
}

export default function BookCard({ book, onDelete }: Props) {
  const color = GENRE_COLORS[book.genre] ?? '#64748b';

  return (
    <div className="book-card">
      <div className="book-card-accent" style={{ background: color }} />
      <div className="book-card-body">
        <span className="badge" style={{ background: `${color}22`, color }}>
          {book.genre}
        </span>
        <Link to={`/books/${book.id}`} className="book-card-title">{book.title}</Link>
        <p className="book-card-author">{book.author}</p>
        <div className="book-card-footer">
          <span className="book-card-year">{book.year}</span>
          {onDelete && (
            <button
              className="btn-icon"
              onClick={(e) => { e.preventDefault(); onDelete(book.id); }}
              aria-label="Delete book"
              title="Delete book"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
