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
  `w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
    hasError
      ? 'border-red-400 bg-red-50'
      : 'border-gray-200 bg-white hover:border-gray-300'
  }`;

const FieldLabel = ({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) => (
  <label className="mb-1.5 block text-sm font-medium text-gray-700">
    {children}
    {required && <span className="ml-0.5 text-red-500">*</span>}
  </label>
);

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="mt-1 text-xs text-red-500">{message}</p> : null;

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
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {formik.status as string}
        </p>
      )}

      <div className="mt-6 flex justify-end gap-3">
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
          {formik.isSubmitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
};
