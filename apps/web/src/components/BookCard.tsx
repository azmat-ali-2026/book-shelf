import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { Book } from '../types';

interface BookCardProps {
  book: Book;
  actions?: ReactNode;
}

const genreColors: Record<string, string> = {
  Technology:    'bg-info/10 text-info border-info/30',
  Fiction:       'bg-accent/10 text-accent border-accent/30',
  Science:       'bg-success/10 text-success border-success/30',
  'Non-Fiction': 'bg-bg-subtle text-text-secondary border-white/7',
  Philosophy:    'bg-error/10 text-error border-error/30',
  History:       'bg-accent/10 text-accent border-accent/30',
};

const genreColor = (genre: string): string =>
  genreColors[genre] ?? 'bg-bg-subtle text-text-secondary border-white/7';

const BookCover = ({ book }: { book: Book }) => {
  if (book.coverUrl) {
    return (
      <img
        src={book.coverUrl}
        alt={`Cover of ${book.title}`}
        className="h-full w-full object-cover"
      />
    );
  }
  const initials = book.title
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  return (
    <div className="flex h-full w-full items-center justify-center bg-bg-overlay">
      <span className="font-display text-2xl font-bold text-text-muted">{initials}</span>
    </div>
  );
};

export const BookCard = ({ book, actions }: BookCardProps) => (
  <div className="group flex flex-col overflow-hidden rounded-xl bg-bg-raised border border-white/7 transition-all duration-200 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
    <Link to={`/books/${book.id}`} className="block">
      <div className="aspect-[3/4] w-full overflow-hidden">
        <BookCover book={book} />
      </div>
    </Link>

    <div className="flex flex-1 flex-col p-4">
      <div className="mb-2 flex items-start justify-between gap-2">
        <span
          className={`inline-flex shrink-0 items-center rounded border px-2 py-0.5 font-body text-xs font-semibold tracking-widest uppercase ${genreColor(book.genre)}`}
        >
          {book.genre}
        </span>
        <span className="shrink-0 font-mono text-xs text-text-muted">{book.year}</span>
      </div>

      <Link to={`/books/${book.id}`}>
        <h3 className="mb-1 line-clamp-2 font-display text-sm font-semibold leading-snug text-text-primary transition-colors duration-200 group-hover:text-accent">
          {book.title}
        </h3>
      </Link>
      <p className="mb-3 font-body text-xs text-text-muted">{book.author}</p>

      {book.description && (
        <p className="mb-3 line-clamp-2 font-body text-xs leading-relaxed text-text-muted">
          {book.description}
        </p>
      )}

      {actions && <div className="mt-auto">{actions}</div>}
    </div>
  </div>
);
