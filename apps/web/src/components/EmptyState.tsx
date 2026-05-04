import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export const EmptyState = ({
  icon = '📚',
  title,
  description,
  action,
}: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/14 bg-bg-raised px-6 py-16 text-center">
    <span className="mb-4 text-5xl">{icon}</span>
    <h3 className="mb-2 font-display text-display-sm font-semibold text-text-primary">{title}</h3>
    {description && (
      <p className="mb-6 max-w-sm font-body text-sm text-text-secondary">{description}</p>
    )}
    {action}
  </div>
);
