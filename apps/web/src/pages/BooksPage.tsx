import { useState, useEffect, useCallback } from 'react';
import type { Book } from '@bookshelf/shared';
import { booksApi } from '../api/books';
import BookCard from '../components/BookCard';
import BookForm from '../components/BookForm';

const GENRES = ['Technology', 'Fiction', 'Science', 'Non-Fiction', 'Philosophy', 'History'];

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const loadBooks = useCallback(async () => {
    setLoading(true);
    try {
      let result: Book[];
      if (query.trim()) {
        result = await booksApi.search(query.trim());
        if (genre) result = result.filter((b) => b.genre.toLowerCase().includes(genre.toLowerCase()));
      } else {
        result = await booksApi.list(genre ? { genre } : undefined);
      }
      setBooks(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [query, genre]);

  useEffect(() => {
    const timer = setTimeout(loadBooks, query ? 300 : 0);
    return () => clearTimeout(timer);
  }, [loadBooks, query]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this book and all its reviews?')) return;
    await booksApi.delete(id);
    setBooks((prev) => prev.filter((b) => b.id !== id));
  };

  const handleBookAdded = (book: Book) => {
    setBooks((prev) => [book, ...prev]);
    setShowAddForm(false);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Books</h1>
        <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>+ Add Book</button>
      </div>

      <div className="filters">
        <input
          className="form-input search-input"
          placeholder="Search by title, author, or genre…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select className="form-input filter-select" value={genre} onChange={(e) => setGenre(e.target.value)}>
          <option value="">All genres</option>
          {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        {(query || genre) && (
          <button className="btn btn-ghost" onClick={() => { setQuery(''); setGenre(''); }}>
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <div className="state-center">Loading…</div>
      ) : books.length === 0 ? (
        <div className="state-center">
          {query || genre ? 'No books match your search.' : 'No books yet.'}
        </div>
      ) : (
        <div className="books-grid">
          {books.map((book) => (
            <BookCard key={book.id} book={book} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {showAddForm && <BookForm onSave={handleBookAdded} onClose={() => setShowAddForm(false)} />}
    </div>
  );
}
