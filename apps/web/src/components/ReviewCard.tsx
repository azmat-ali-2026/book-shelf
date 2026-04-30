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
  <div className="rounded-xl bg-gray-50 p-4">
    <div className="mb-3 flex items-start justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 text-xs font-bold text-white">
          {userInitials(review.userId)}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{review.userId}</p>
          <p className="text-xs text-gray-400">{formatDate(review.createdAt)}</p>
        </div>
      </div>
      <StarRating value={review.rating} readonly size="sm" />
    </div>
    {review.text && <p className="text-sm leading-relaxed text-gray-700">{review.text}</p>}
  </div>
);
