import { z } from 'zod';

const currentYear = new Date().getFullYear();

export const bookFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  author: z.string().min(1, 'Author is required').max(100, 'Author is too long'),
  genre: z.string().min(1, 'Please select a genre'),
  year: z.coerce
    .number({ invalid_type_error: 'Please enter a valid year' })
    .int('Year must be a whole number')
    .min(1000, 'Year must be after 1000')
    .max(currentYear, `Year cannot be in the future`),
  isbn: z.string(),
  description: z.string().max(2000, 'Description is too long'),
  coverUrl: z.union([z.string().url('Please enter a valid URL'), z.literal('')]),
});

export type BookFormValues = {
  title: string;
  author: string;
  genre: string;
  year: string;
  isbn: string;
  description: string;
  coverUrl: string;
};
