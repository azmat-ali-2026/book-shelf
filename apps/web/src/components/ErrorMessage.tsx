interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage = ({ message, onRetry }: ErrorMessageProps) => (
  <div className="flex flex-col items-center justify-center rounded-2xl bg-red-50 px-6 py-12 text-center">
    <span className="mb-3 text-4xl">⚠️</span>
    <p className="mb-4 text-sm font-medium text-red-700">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      >
        Try again
      </button>
    )}
  </div>
);
