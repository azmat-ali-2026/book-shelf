import { z } from 'zod';

export const createBookSchema = z.object({
  title: z.string().min(1).max(200),
  author: z.string().min(1).max(100),
  genre: z.string().min(1),
  year: z.number().int().min(1000).max(new Date().getFullYear()),
  isbn: z.string().optional(),
  description: z.string().max(2000).optional(),
  coverUrl: z.string().url().nullable().optional(),
});

export const updateBookSchema = createBookSchema.partial();

export const createShelfSchema = z.object({
  userId: z.string().min(1),
  name: z.string().min(1).max(100),
});

export const addBookToShelfSchema = z.object({
  bookId: z.string().min(1),
});

export const createReviewSchema = z.object({
  userId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  text: z.string().max(5000).optional(),
});

export const listBooksQuerySchema = z.object({
  genre: z.string().optional(),
  year: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .optional(),
});
