interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = { sm: 'h-3.5 w-3.5', md: 'h-5 w-5', lg: 'h-6 w-6' };

export const StarRating = ({
  value,
  onChange,
  readonly = false,
  size = 'md',
}: StarRatingProps) => (
  <div className="flex gap-0.5" role={readonly ? undefined : 'radiogroup'} aria-label="Rating">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        disabled={readonly}
        onClick={() => onChange?.(star)}
        className={`transition-transform ${
          readonly
            ? 'cursor-default'
            : 'cursor-pointer hover:scale-110 focus:outline-none focus:ring-1 focus:ring-yellow-400 focus:ring-offset-1'
        }`}
        aria-label={readonly ? undefined : `Rate ${star} star${star > 1 ? 's' : ''}`}
      >
        <svg
          className={`${sizes[size]} ${star <= value ? 'text-yellow-400' : 'text-gray-200'} transition-colors`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      </button>
    ))}
  </div>
);
