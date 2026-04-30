import { useFormik } from 'formik';
import type { Book } from '../types';
import { GENRES } from '../constants';
import { bookFormSchema, type BookFormValues } from '../schemas/bookSchema';
import { toFormikValidate } from '../lib/zodFormik';

interface BookFormProps {
  initial?: Partial<Book>;
  onSubmit: (data: Omit<Book, 'id' | 'addedAt'>) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

const fieldClass = (hasError: boolean) =>
  `w-full rounded-lg border bg-bg-overlay px-3.5 py-2.5 font-body text-sm text-text-primary placeholder:text-text-muted transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent ${
    hasError ? 'border-error/60' : 'border-white/7 hover:border-white/14'
  }`;

const FieldLabel = ({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) => (
  <label className="mb-1.5 block font-body text-sm font-medium text-text-secondary">
    {children}
    {required && <span className="ml-0.5 text-error">*</span>}
  </label>
);

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="mt-1 font-body text-xs text-error">{message}</p> : null;

export const BookForm = ({
  initial,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
}: BookFormProps) => {
  const formik = useFormik<BookFormValues>({
    initialValues: {
      title: initial?.title ?? '',
      author: initial?.author ?? '',
      genre: initial?.genre ?? '',
      year: initial?.year ? String(initial.year) : '',
      isbn: initial?.isbn ?? '',
      description: initial?.description ?? '',
      coverUrl: initial?.coverUrl ?? '',
    },
    validate: toFormikValidate(bookFormSchema),
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      try {
        await onSubmit({
          title: values.title.trim(),
          author: values.author.trim(),
          genre: values.genre,
          year: Number(values.year),
          isbn: values.isbn.trim() || undefined,
          description: values.description.trim() || undefined,
          coverUrl: values.coverUrl.trim() || null,
        });
      } catch (err) {
        setStatus(err instanceof Error ? err.message : 'Something went wrong');
        setSubmitting(false);
      }
    },
  });

  const err = (field: keyof BookFormValues) =>
    formik.touched[field] ? formik.errors[field] : undefined;

  return (
    <form onSubmit={formik.handleSubmit} noValidate>
      <div className="space-y-4">
        <div>
          <FieldLabel required>Title</FieldLabel>
          <input
            type="text"
            {...formik.getFieldProps('title')}
            className={fieldClass(!!err('title'))}
            placeholder="e.g. The Great Gatsby"
            maxLength={200}
          />
          <FieldError message={err('title')} />
        </div>

        <div>
          <FieldLabel required>Author</FieldLabel>
          <input
            type="text"
            {...formik.getFieldProps('author')}
            className={fieldClass(!!err('author'))}
            placeholder="e.g. F. Scott Fitzgerald"
            maxLength={100}
          />
          <FieldError message={err('author')} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel required>Genre</FieldLabel>
            <select
              {...formik.getFieldProps('genre')}
              className={fieldClass(!!err('genre'))}
            >
              <option value="">Select genre…</option>
              {GENRES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            <FieldError message={err('genre')} />
          </div>

          <div>
            <FieldLabel required>Year</FieldLabel>
            <input
              type="number"
              {...formik.getFieldProps('year')}
              className={fieldClass(!!err('year'))}
              placeholder={String(new Date().getFullYear())}
              min={1000}
              max={new Date().getFullYear()}
            />
            <FieldError message={err('year')} />
          </div>
        </div>

        <div>
          <FieldLabel>ISBN</FieldLabel>
          <input
            type="text"
            {...formik.getFieldProps('isbn')}
            className={fieldClass(false)}
            placeholder="e.g. 9780743273565"
          />
        </div>

        <div>
          <FieldLabel>Cover URL</FieldLabel>
          <input
            type="url"
            {...formik.getFieldProps('coverUrl')}
            className={fieldClass(!!err('coverUrl'))}
            placeholder="https://…"
          />
          <FieldError message={err('coverUrl')} />
        </div>

        <div>
          <FieldLabel>Description</FieldLabel>
          <textarea
            {...formik.getFieldProps('description')}
            className={`${fieldClass(!!err('description'))} resize-none`}
            rows={3}
            placeholder="A brief description…"
            maxLength={2000}
          />
          <FieldError message={err('description')} />
        </div>
      </div>

      {formik.status && (
        <p className="mt-4 rounded-lg border border-error/30 bg-error/10 px-3 py-2 font-body text-sm text-error">
          {formik.status as string}
        </p>
      )}

      <div className="mt-6 flex justify-end gap-3">
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
          {formik.isSubmitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
};
