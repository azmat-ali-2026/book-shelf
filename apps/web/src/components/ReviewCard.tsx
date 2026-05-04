import type { Review } from '../types';
import { StarRating } from './StarRating';

interface ReviewCardProps {
  review: Review;
}

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const userInitials = (userId: string): string => userId.slice(0, 2).toUpperCase();

export const ReviewCard = ({ review }: ReviewCardProps) => (
  <div className="rounded-xl bg-bg-overlay border border-white/7 p-4">
    <div className="mb-3 flex items-start justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent font-body text-xs font-bold text-text-inverse">
          {userInitials(review.userId)}
        </div>
        <div>
          <p className="font-body text-sm font-medium text-text-primary">{review.userId}</p>
          <p className="font-mono text-xs text-text-muted">{formatDate(review.createdAt)}</p>
        </div>
      </div>
      <StarRating value={review.rating} readonly size="sm" />
    </div>
    {review.text && (
      <p className="font-body text-sm leading-relaxed text-text-secondary">{review.text}</p>
    )}
  </div>
);
