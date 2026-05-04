interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };

export const Spinner = ({ size = 'md', className = '' }: SpinnerProps) => (
  <div
    className={`animate-spin rounded-full border-2 border-white/14 border-t-accent ${sizes[size]} ${className}`}
    role="status"
    aria-label="Loading"
  />
);

export const FullPageSpinner = () => (
  <div className="flex min-h-64 items-center justify-center">
    <Spinner size="lg" />
  </div>
);
