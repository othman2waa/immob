import {z} from 'zod';

export const unitInputSchema = z.object({
  reference: z.string().trim().min(1).max(80),
  surface: z.number().positive().max(1_000_000),
  price: z.number().nonnegative().max(999_999_999_999.99).nullable(),
  floor: z.number().int().min(-5).max(200).nullable(),
  bedrooms: z.number().int().min(0).max(100).nullable(),
  bathrooms: z.number().int().min(0).max(100).nullable()
});

export const projectProgressSchema = z.number().int().min(0).max(100);
