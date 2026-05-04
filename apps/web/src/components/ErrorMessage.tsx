interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage = ({ message, onRetry }: ErrorMessageProps) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-error/30 bg-bg-raised px-6 py-12 text-center">
    <span className="mb-3 text-4xl">⚠️</span>
    <p className="mb-4 font-body text-sm font-medium text-error">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="rounded-lg bg-error px-4 py-2 font-body text-sm font-semibold text-text-inverse transition-all duration-150 hover:opacity-90 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-error/30"
      >
        Try again
      </button>
    )}
  </div>
);
