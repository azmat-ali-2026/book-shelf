import { useFormik } from 'formik';
import { reviewFormSchema, type ReviewFormValues } from '../schemas/reviewSchema';
import { toFormikValidate } from '../lib/zodFormik';
import { StarRating } from './StarRating';

interface ReviewFormProps {
  onSubmit: (rating: number, text: string) => Promise<void>;
  onCancel: () => void;
}

export const ReviewForm = ({ onSubmit, onCancel }: ReviewFormProps) => {
  const formik = useFormik<ReviewFormValues>({
    initialValues: { rating: 0, text: '' },
    validate: toFormikValidate(reviewFormSchema),
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      try {
        await onSubmit(values.rating, values.text.trim());
      } catch (err) {
        setStatus(err instanceof Error ? err.message : 'Something went wrong');
        setSubmitting(false);
      }
    },
  });

  const ratingError = formik.touched.rating ? formik.errors.rating : undefined;

  return (
    <form onSubmit={formik.handleSubmit} noValidate>
      <div className="mb-4">
        <label className="mb-2 block font-body text-sm font-medium text-text-secondary">
          Rating <span className="text-error">*</span>
        </label>
        <StarRating
          value={formik.values.rating}
          size="lg"
          onChange={(r) => {
            void formik.setFieldValue('rating', r);
            void formik.setFieldTouched('rating', true);
          }}
        />
        {ratingError && <p className="mt-1 font-body text-xs text-error">{ratingError}</p>}
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block font-body text-sm font-medium text-text-secondary">
          Review{' '}
          <span className="font-body text-xs font-normal text-text-muted">(optional)</span>
        </label>
        <textarea
          {...formik.getFieldProps('text')}
          className="w-full resize-none rounded-lg border border-white/7 bg-bg-overlay px-3.5 py-2.5 font-body text-sm text-text-primary placeholder:text-text-muted transition-colors duration-150 hover:border-white/14 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
          rows={4}
          placeholder="Share your thoughts…"
          maxLength={5000}
        />
        <p className="mt-1 text-right font-mono text-xs text-text-muted">
          {formik.values.text.length}/5000
        </p>
      </div>

      {formik.status && (
        <p className="mb-4 rounded-lg border border-error/30 bg-error/10 px-3 py-2 font-body text-sm text-error">
          {formik.status as string}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={formik.isSubmitting}
          className="rounded-lg border border-white/7 bg-transparent px-5 py-2.5 font-body text-sm font-medium text-text-secondary transition-all duration-150 hover:border-white/14 hover:text-text-primary disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="rounded-lg bg-accent px-5 py-2.5 font-body text-sm font-semibold text-text-inverse transition-all duration-150 hover:bg-accent-dim active:scale-[0.97] disabled:opacity-60"
        >
          {formik.isSubmitting ? 'Submitting…' : 'Submit Review'}
        </button>
      </div>
    </form>
  );
};
