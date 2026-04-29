import { Link } from 'react-router-dom';
import type { Shelf } from '../types';

interface ShelfCardProps {
  shelf: Shelf;
}

const shelfGradients = [
  'from-blue-500 to-indigo-600',
  'from-purple-500 to-pink-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-rose-600',
  'from-cyan-500 to-blue-600',
  'from-violet-500 to-purple-600',
];

const shelfGradient = (id: string): string => {
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return shelfGradients[hash % shelfGradients.length] ?? shelfGradients[0]!;
};

export const ShelfCard = ({ shelf }: ShelfCardProps) => {
  const gradient = shelfGradient(shelf.id);
  const count = shelf.bookIds.length;

  return (
    <Link to={`/shelves/${shelf.id}`}>
      <div className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:ring-primary-100">
        <div
          className={`flex h-28 items-center justify-center bg-gradient-to-br ${gradient} p-4`}
        >
          <span className="text-5xl transition-transform duration-200 group-hover:scale-110">
            🗂️
          </span>
        </div>
        <div className="p-4">
          <h3 className="mb-1 truncate font-semibold text-gray-900 transition-colors group-hover:text-primary-600">
            {shelf.name}
          </h3>
          <p className="text-sm text-gray-500">
            {count === 0 ? 'No books yet' : `${count} book${count !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>
    </Link>
  );
};
