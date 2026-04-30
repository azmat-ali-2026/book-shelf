import { Link } from 'react-router-dom';
import type { Shelf } from '../types';

interface ShelfCardProps {
  shelf: Shelf;
}

export const ShelfCard = ({ shelf }: ShelfCardProps) => {
  const count = shelf.bookIds.length;

  return (
    <Link to={`/shelves/${shelf.id}`}>
      <div className="group overflow-hidden rounded-xl bg-bg-raised border border-white/7 transition-all duration-200 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <div className="relative flex h-28 items-center justify-center border-b border-white/7 bg-bg-overlay">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(232,164,74,0.07),transparent)]" />
          <span className="text-4xl transition-transform duration-200 group-hover:scale-110">
            🗂️
          </span>
        </div>
        <div className="p-4">
          <h3 className="mb-1 truncate font-display text-sm font-semibold text-text-primary transition-colors duration-200 group-hover:text-accent">
            {shelf.name}
          </h3>
          <p className="font-body text-sm text-text-muted">
            {count === 0 ? 'No books yet' : `${count} book${count !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>
    </Link>
  );
};
