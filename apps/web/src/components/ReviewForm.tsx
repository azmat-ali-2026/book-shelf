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
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Rating <span className="text-red-500">*</span>
        </label>
        <StarRating
          value={formik.values.rating}
          size="lg"
          onChange={(r) => {
            void formik.setFieldValue('rating', r);
            void formik.setFieldTouched('rating', true);
          }}
        />
        {ratingError && <p className="mt-1 text-xs text-red-500">{ratingError}</p>}
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Review{' '}
          <span className="text-xs font-normal text-gray-400">(optional)</span>
        </label>
        <textarea
          {...formik.getFieldProps('text')}
          className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition hover:border-gray-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
          rows={4}
          placeholder="Share your thoughts…"
          maxLength={5000}
        />
        <p className="mt-1 text-right text-xs text-gray-400">
          {formik.values.text.length}/5000
        </p>
      </div>

      {formik.status && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {formik.status as string}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={formik.isSubmitting}
          className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-60"
        >
          {formik.isSubmitting ? 'Submitting…' : 'Submit Review'}
        </button>
      </div>
    </form>
  );
};
