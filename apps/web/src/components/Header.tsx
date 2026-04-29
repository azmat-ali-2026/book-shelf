import { NavLink } from 'react-router-dom';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `relative px-1 py-0.5 text-sm font-medium transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:rounded-full after:transition-all ${
    isActive
      ? 'text-primary-600 after:bg-primary-600'
      : 'text-gray-600 hover:text-gray-900 after:bg-transparent hover:after:bg-gray-300'
  }`;

export const Header = () => (
  <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-md">
    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
      <NavLink to="/" className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-secondary-600 shadow-sm">
          <span className="text-base">📚</span>
        </div>
        <span className="text-lg font-bold text-gray-900">BookShelf</span>
      </NavLink>

      <nav className="flex items-center gap-6">
        <NavLink to="/" end className={navLinkClass}>
          Books
        </NavLink>
        <NavLink to="/shelves" className={navLinkClass}>
          My Shelves
        </NavLink>
      </nav>
    </div>
  </header>
);
