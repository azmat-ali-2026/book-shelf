import { useState } from 'react';
import type { Book } from '../types';
import { GENRES } from '../constants';

type BookFormData = {
  title: string;
  author: string;
  genre: string;
  year: string;
  isbn: string;
  description: string;
  coverUrl: string;
};

interface BookFormProps {
  initial?: Partial<Book>;
  onSubmit: (data: Omit<Book, 'id' | 'addedAt'>) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

function fieldClass(error?: boolean) {
  return `w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
    error ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'
  }`;
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-gray-700">
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
}

export function BookForm({ initial, onSubmit, onCancel, submitLabel = 'Save' }: BookFormProps) {
  const [form, setForm] = useState<BookFormData>({
    title: initial?.title ?? '',
    author: initial?.author ?? '',
    genre: initial?.genre ?? '',
    year: initial?.year ? String(initial.year) : '',
    isbn: initial?.isbn ?? '',
    description: initial?.description ?? '',
    coverUrl: initial?.coverUrl ?? '',
  });
  const [errors, setErrors] = useState<Partial<BookFormData>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  function validate(): boolean {
    const errs: Partial<BookFormData> = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.author.trim()) errs.author = 'Author is required';
    if (!form.genre) errs.genre = 'Genre is required';
    const y = Number(form.year);
    if (!form.year || isNaN(y) || y < 1000 || y > new Date().getFullYear()) {
      errs.year = `Year must be between 1000 and ${new Date().getFullYear()}`;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setServerError('');
    try {
      await onSubmit({
        title: form.title.trim(),
        author: form.author.trim(),
        genre: form.genre,
        year: Number(form.year),
        isbn: form.isbn.trim() || undefined,
        description: form.description.trim() || undefined,
        coverUrl: form.coverUrl.trim() || null,
      });
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  function set(field: keyof BookFormData, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="space-y-4">
        <div>
          <Label required>Title</Label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            className={fieldClass(!!errors.title)}
            placeholder="e.g. The Great Gatsby"
            maxLength={200}
          />
          {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
        </div>

        <div>
          <Label required>Author</Label>
          <input
            type="text"
            value={form.author}
            onChange={(e) => set('author', e.target.value)}
            className={fieldClass(!!errors.author)}
            placeholder="e.g. F. Scott Fitzgerald"
            maxLength={100}
          />
          {errors.author && <p className="mt-1 text-xs text-red-500">{errors.author}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label required>Genre</Label>
            <select
              value={form.genre}
              onChange={(e) => set('genre', e.target.value)}
              className={fieldClass(!!errors.genre)}
            >
              <option value="">Select genre…</option>
              {GENRES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            {errors.genre && <p className="mt-1 text-xs text-red-500">{errors.genre}</p>}
          </div>

          <div>
            <Label required>Year</Label>
            <input
              type="number"
              value={form.year}
              onChange={(e) => set('year', e.target.value)}
              className={fieldClass(!!errors.year)}
              placeholder={String(new Date().getFullYear())}
              min={1000}
              max={new Date().getFullYear()}
            />
            {errors.year && <p className="mt-1 text-xs text-red-500">{errors.year}</p>}
          </div>
        </div>

        <div>
          <Label>ISBN</Label>
          <input
            type="text"
            value={form.isbn}
            onChange={(e) => set('isbn', e.target.value)}
            className={fieldClass()}
            placeholder="e.g. 9780743273565"
          />
        </div>

        <div>
          <Label>Cover URL</Label>
          <input
            type="url"
            value={form.coverUrl}
            onChange={(e) => set('coverUrl', e.target.value)}
            className={fieldClass()}
            placeholder="https://…"
          />
        </div>

        <div>
          <Label>Description</Label>
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            className={`${fieldClass()} resize-none`}
            rows={3}
            placeholder="A brief description…"
            maxLength={2000}
          />
        </div>
      </div>

      {serverError && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{serverError}</p>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-60"
        >
          {submitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
