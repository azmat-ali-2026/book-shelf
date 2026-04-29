import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Book, Shelf } from '@bookshelf/shared';
import { shelvesApi } from '../api/shelves';
import { booksApi } from '../api/books';

const USER_ID = 'user_1';

export default function ShelvesPage() {
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [bookMap, setBookMap] = useState<Record<string, Book>>({});
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    Promise.all([shelvesApi.list(USER_ID), booksApi.list()])
      .then(([shelvesList, allBooks]) => {
        setShelves(shelvesList);
        const map: Record<string, Book> = {};
        allBooks.forEach((b) => { map[b.id] = b; });
        setBookMap(map);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const shelf = await shelvesApi.create({ userId: USER_ID, name: newName.trim() });
      setShelves((prev) => [...prev, shelf]);
      setNewName('');
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleRemoveBook = async (shelfId: string, bookId: string) => {
    await shelvesApi.removeBook(shelfId, bookId);
    setShelves((prev) =>
      prev.map((s) =>
        s.id === shelfId ? { ...s, bookIds: s.bookIds.filter((id) => id !== bookId) } : s,
      ),
    );
  };

  if (loading) return <div className="state-center">Loading…</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Shelves</h1>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <form onSubmit={handleCreate} className="create-shelf-form">
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">New Shelf</label>
            <input
              className="form-input"
              placeholder="e.g. Currently Reading"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>
          <button className="btn btn-primary create-shelf-btn" type="submit" disabled={creating || !newName.trim()}>
            Create
          </button>
        </form>
      </div>

      {shelves.length === 0 ? (
        <div className="state-center">
          <p>No shelves yet.</p>
          <p className="text-muted text-sm" style={{ marginTop: '0.5rem' }}>
            Create a shelf above, then <Link to="/books">browse books</Link> to add them.
          </p>
        </div>
      ) : (
        shelves.map((shelf) => (
          <div key={shelf.id} className="card shelf-card">
            <div className="shelf-header">
              <span className="shelf-name">{shelf.name}</span>
              <span className="text-muted text-sm">
                {shelf.bookIds.length} {shelf.bookIds.length === 1 ? 'book' : 'books'}
              </span>
            </div>
            {shelf.bookIds.length === 0 ? (
              <p className="empty-shelf">No books on this shelf yet.</p>
            ) : (
              <div className="shelf-books">
                {shelf.bookIds.map((bookId) => {
                  const book = bookMap[bookId];
                  return (
                    <div key={bookId} className="shelf-book-row">
                      <div>
                        {book ? (
                          <>
                            <Link to={`/books/${bookId}`} className="shelf-book-title">
                              {book.title}
                            </Link>
                            <p className="shelf-book-author">{book.author}</p>
                          </>
                        ) : (
                          <span className="text-muted">{bookId}</span>
                        )}
                      </div>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleRemoveBook(shelf.id, bookId)}
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
