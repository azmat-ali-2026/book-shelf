import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import BooksPage from './pages/BooksPage';
import BookDetailPage from './pages/BookDetailPage';
import ShelvesPage from './pages/ShelvesPage';

export default function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/books" replace />} />
          <Route path="/books" element={<BooksPage />} />
          <Route path="/books/:id" element={<BookDetailPage />} />
          <Route path="/shelves" element={<ShelvesPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
