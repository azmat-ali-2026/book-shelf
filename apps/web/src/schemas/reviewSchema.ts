import { z } from 'zod';

export const reviewFormSchema = z.object({
  rating: z
    .number({ invalid_type_error: 'Please select a rating' })
    .int()
    .min(1, 'Please select a rating')
    .max(5),
  text: z.string().max(5000, 'Review is too long'),
});

export type ReviewFormValues = {
  rating: number;
  text: string;
};
