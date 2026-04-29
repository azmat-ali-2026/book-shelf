import { useState } from 'react';
import type { Book } from '@bookshelf/shared';
import { booksApi } from '../api/books';

const GENRES = ['Technology', 'Fiction', 'Science', 'Non-Fiction', 'Philosophy', 'History'];

interface Props {
  book?: Book;
  onSave: (book: Book) => void;
  onClose: () => void;
}

export default function BookForm({ book, onSave, onClose }: Props) {
  const [form, setForm] = useState({
    title: book?.title ?? '',
    author: book?.author ?? '',
    genre: book?.genre ?? '',
    year: String(book?.year ?? new Date().getFullYear()),
    isbn: book?.isbn ?? '',
    description: book?.description ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const field =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.title || !form.author || !form.genre || !form.year) {
      setError('Title, author, genre, and year are required.');
      return;
    }
    setSaving(true);
    try {
      const dto = {
        title: form.title,
        author: form.author,
        genre: form.genre,
        year: Number(form.year),
        ...(form.isbn ? { isbn: form.isbn } : {}),
        ...(form.description ? { description: form.description } : {}),
      };
      const saved = book ? await booksApi.update(book.id, dto) : await booksApi.create(dto);
      onSave(saved);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2 className="modal-title">{book ? 'Edit Book' : 'Add Book'}</h2>
        <form onSubmit={handleSubmit} className="form-stack">
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input className="form-input" value={form.title} onChange={field('title')} placeholder="Book title" />
          </div>
          <div className="form-group">
            <label className="form-label">Author *</label>
            <input className="form-input" value={form.author} onChange={field('author')} placeholder="Author name" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Genre *</label>
              <select className="form-input" value={form.genre} onChange={field('genre')}>
                <option value="">Select genre</option>
                {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Year *</label>
              <input
                className="form-input"
                type="number"
                value={form.year}
                onChange={field('year')}
                min="1000"
                max={new Date().getFullYear()}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">ISBN</label>
            <input className="form-input" value={form.isbn} onChange={field('isbn')} placeholder="Optional" />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              rows={3}
              value={form.description}
              onChange={field('description')}
              placeholder="Optional"
              style={{ resize: 'vertical' }}
            />
          </div>
          {error && <p className="form-error">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
