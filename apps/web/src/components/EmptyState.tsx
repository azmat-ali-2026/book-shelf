interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon = '📚', title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white px-6 py-16 text-center">
      <span className="mb-4 text-5xl">{icon}</span>
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
      {description && <p className="mb-6 max-w-sm text-sm text-gray-500">{description}</p>}
      {action}
    </div>
  );
}
