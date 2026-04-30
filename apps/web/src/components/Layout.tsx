import type { ReactNode } from 'react';
import { Header } from './Header';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => (
  <div className="min-h-screen bg-bg-base font-body">
    <Header />
    <main className="mx-auto max-w-[1200px] px-4 py-8 sm:px-8 lg:px-16">{children}</main>
  </div>
);
