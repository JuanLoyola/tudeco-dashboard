import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().trim().min(2).max(60),
  slug: z.string().trim().min(2).max(60).optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
