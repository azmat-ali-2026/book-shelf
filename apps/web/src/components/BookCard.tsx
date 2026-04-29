import { Link } from 'react-router-dom';
import type { Book } from '../types';

interface BookCardProps {
  book: Book;
  actions?: React.ReactNode;
}

const genreColors: Record<string, string> = {
  Technology: 'bg-blue-50 text-blue-700',
  Fiction: 'bg-purple-50 text-purple-700',
  Science: 'bg-green-50 text-green-700',
  'Non-Fiction': 'bg-orange-50 text-orange-700',
  Philosophy: 'bg-pink-50 text-pink-700',
  History: 'bg-amber-50 text-amber-700',
};

function genreColor(genre: string): string {
  return genreColors[genre] ?? 'bg-gray-100 text-gray-600';
}

function BookCover({ book }: { book: Book }) {
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
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
      <span className="text-2xl font-bold text-primary-300">{initials}</span>
    </div>
  );
}

export function BookCard({ book, actions }: BookCardProps) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:ring-primary-100">
      <Link to={`/books/${book.id}`} className="block">
        <div className="aspect-[3/4] w-full overflow-hidden">
          <BookCover book={book} />
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ${genreColor(book.genre)}`}>
            {book.genre}
          </span>
          <span className="shrink-0 text-xs text-gray-400">{book.year}</span>
        </div>

        <Link to={`/books/${book.id}`}>
          <h3 className="mb-1 line-clamp-2 text-sm font-semibold leading-snug text-gray-900 transition-colors group-hover:text-primary-600">
            {book.title}
          </h3>
        </Link>
        <p className="mb-3 text-xs text-gray-500">{book.author}</p>

        {book.description && (
          <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-gray-400">
            {book.description}
          </p>
        )}

        {actions && <div className="mt-auto">{actions}</div>}
      </div>
    </div>
  );
}
