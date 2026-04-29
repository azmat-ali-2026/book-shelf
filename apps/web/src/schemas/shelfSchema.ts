import { z } from 'zod';

export const shelfFormSchema = z.object({
  name: z.string().min(1, 'Shelf name is required').max(100, 'Name is too long'),
});

export type ShelfFormValues = {
  name: string;
};
