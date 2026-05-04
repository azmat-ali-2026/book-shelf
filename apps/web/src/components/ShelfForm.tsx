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
      <label className="mb-1.5 block font-body text-sm font-medium text-text-secondary">
        Shelf name <span className="text-error">*</span>
      </label>
      <input
        type="text"
        {...formik.getFieldProps('name')}
        autoFocus
        maxLength={100}
        placeholder="e.g. Want to Read"
        className={`w-full rounded-lg border bg-bg-overlay px-3.5 py-2.5 font-body text-sm text-text-primary placeholder:text-text-muted transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent ${
          nameError ? 'border-error/60' : 'border-white/7 hover:border-white/14'
        }`}
      />
      {nameError && <p className="mt-1 font-body text-xs text-error">{nameError}</p>}

      {formik.status && (
        <p className="mt-3 rounded-lg border border-error/30 bg-error/10 px-3 py-2 font-body text-sm text-error">
          {formik.status as string}
        </p>
      )}

      <div className="mt-5 flex justify-end gap-3">
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
          {formik.isSubmitting ? 'Creating…' : 'Create Shelf'}
        </button>
      </div>
    </form>
  );
};
