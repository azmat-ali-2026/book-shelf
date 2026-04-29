import type { ReactNode } from 'react';
import { Header } from './Header';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => (
  <div className="min-h-screen bg-gray-50 font-sans">
    <Header />
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
  </div>
);
