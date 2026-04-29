import { useState, useEffect, useCallback } from 'react';
import type { Shelf } from '../types';
import { shelvesApi } from '../api/shelves';
import { ShelfCard } from '../components/ShelfCard';
import { Modal } from '../components/Modal';
import { ShelfForm } from '../components/ShelfForm';
import { EmptyState } from '../components/EmptyState';
import { ErrorMessage } from '../components/ErrorMessage';
import { FullPageSpinner } from '../components/Spinner';
import { DEMO_USER_ID } from '../constants';

export function ShelvesPage() {
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await shelvesApi.list(DEMO_USER_ID);
      setShelves(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load shelves');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function handleCreate(name: string) {
    const shelf = await shelvesApi.create({ userId: DEMO_USER_ID, name });
    setShelves((prev) => [shelf, ...prev]);
    setShowCreate(false);
  }

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Shelves</h1>
          <p className="mt-1 text-sm text-gray-500">
            {loading ? 'Loading…' : `${shelves.length} shelf${shelves.length !== 1 ? 'ves' : ''}`}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Shelf
        </button>
      </div>

      {loading && <FullPageSpinner />}
      {!loading && error && <ErrorMessage message={error} onRetry={load} />}

      {!loading && !error && shelves.length === 0 && (
        <EmptyState
          icon="🗂️"
          title="No shelves yet"
          description="Create a shelf to organise your books — want to read, currently reading, finished…"
          action={
            <button
              onClick={() => setShowCreate(true)}
              className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
            >
              Create Your First Shelf
            </button>
          }
        />
      )}

      {!loading && !error && shelves.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {shelves.map((shelf) => (
            <ShelfCard key={shelf.id} shelf={shelf} />
          ))}
        </div>
      )}

      <Modal open={showCreate} title="New Shelf" onClose={() => setShowCreate(false)}>
        <ShelfForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} />
      </Modal>
    </>
  );
}
