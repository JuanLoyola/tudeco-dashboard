import { z } from 'zod';

export const createProductSchema = z.object({
  sku: z.string().trim().min(2).max(40),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2000).optional().nullable(),
  price: z.coerce.number().nonnegative(),
  cost: z.coerce.number().nonnegative().optional().nullable(),
  // Sin `.default()`: los defaults los pone la columna en la base
  // y así el PATCH parcial no pisa valores con defaults fantasma.
  stock: z.coerce.number().int().min(0).optional(),
  minStock: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  categoryId: z.coerce.number().int().positive().optional().nullable(),
});

export const updateProductSchema = createProductSchema.partial();

export const listProductsQuerySchema = z.object({
  search: z.string().trim().min(1).optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  includeInactive: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  page: z.coerce.number().int().min(1).default(1),
  take: z.coerce.number().int().min(1).max(100).default(20),
});

export const idParamSchema = z.coerce.number().int().positive();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
