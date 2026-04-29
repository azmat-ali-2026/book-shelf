import { NavLink } from 'react-router-dom';

export default function NavBar() {
  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-brand">📚 BookShelf</NavLink>
      <NavLink to="/books" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>
        Books
      </NavLink>
      <NavLink to="/shelves" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>
        Shelves
      </NavLink>
    </nav>
  );
}
