import { NavLink } from 'react-router-dom';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `relative px-1 py-0.5 font-body text-sm font-medium transition-colors duration-200 after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:rounded-full after:transition-all after:duration-200 ${
    isActive
      ? 'text-accent after:bg-accent'
      : 'text-text-secondary hover:text-text-primary after:bg-transparent'
  }`;

export const Header = () => (
  <header className="sticky top-0 z-40 border-b border-white/7 bg-bg-base/90 backdrop-blur-md">
    <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-4 sm:px-8 lg:px-16">
      <NavLink to="/" className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-dim shadow-sm">
          <span className="text-base">📚</span>
        </div>
        <span className="font-display text-lg font-bold text-text-primary">BookShelf</span>
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
