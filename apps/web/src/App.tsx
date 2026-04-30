import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/Layout';
import { BooksPage } from './pages/BooksPage';
import { BookDetailPage } from './pages/BookDetailPage';
import { ShelvesPage } from './pages/ShelvesPage';
import { ShelfDetailPage } from './pages/ShelfDetailPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

const NotFound = () => (
  <div className="flex min-h-64 flex-col items-center justify-center text-center">
    <p className="mb-2 text-5xl">🔭</p>
    <h2 className="mb-1 text-xl font-bold text-gray-900">Page not found</h2>
    <p className="text-sm text-gray-500">The page you're looking for doesn't exist.</p>
  </div>
);

export const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<BooksPage />} />
          <Route path="/books/:id" element={<BookDetailPage />} />
          <Route path="/shelves" element={<ShelvesPage />} />
          <Route path="/shelves/:id" element={<ShelfDetailPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  </QueryClientProvider>
);
