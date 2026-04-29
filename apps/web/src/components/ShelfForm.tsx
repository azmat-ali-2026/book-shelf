import { useFormik } from 'formik';
import { shelfFormSchema, type ShelfFormValues } from '../schemas/shelfSchema';
import { toFormikValidate } from '../lib/zodFormik';

interface ShelfFormProps {
  onSubmit: (name: string) => Promise<void>;
  onCancel: () => void;
}

export const ShelfForm = ({ onSubmit, onCancel }: ShelfFormProps) => {
  const formik = useFormik<ShelfFormValues>({
    initialValues: { name: '' },
    validate: toFormikValidate(shelfFormSchema),
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      try {
        await onSubmit(values.name.trim());
      } catch (err) {
        setStatus(err instanceof Error ? err.message : 'Something went wrong');
        setSubmitting(false);
      }
    },
  });

  const nameError = formik.touched.name ? formik.errors.name : undefined;

  return (
    <form onSubmit={formik.handleSubmit} noValidate>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        Shelf name <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        {...formik.getFieldProps('name')}
        autoFocus
        maxLength={100}
        placeholder="e.g. Want to Read"
        className={`w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 ${
          nameError
            ? 'border-red-400 bg-red-50'
            : 'border-gray-200 bg-white hover:border-gray-300'
        }`}
      />
      {nameError && <p className="mt-1 text-xs text-red-500">{nameError}</p>}

      {formik.status && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {formik.status as string}
        </p>
      )}

      <div className="mt-5 flex justify-end gap-3">
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
          {formik.isSubmitting ? 'Creating…' : 'Create Shelf'}
        </button>
      </div>
    </form>
  );
};
