import { useState } from 'react';

interface ShelfFormProps {
  onSubmit: (name: string) => Promise<void>;
  onCancel: () => void;
}

export function ShelfForm({ onSubmit, onCancel }: ShelfFormProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError('Shelf name is required'); return; }
    setSubmitting(true);
    setServerError('');
    try {
      await onSubmit(name.trim());
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        Shelf name <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        value={name}
        onChange={(e) => { setName(e.target.value); setError(''); }}
        className={`w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
          error ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'
        }`}
        placeholder="e.g. Want to Read"
        maxLength={100}
        autoFocus
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {serverError && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{serverError}</p>
      )}
      <div className="mt-5 flex justify-end gap-3">
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
          {submitting ? 'Creating…' : 'Create Shelf'}
        </button>
      </div>
    </form>
  );
}
