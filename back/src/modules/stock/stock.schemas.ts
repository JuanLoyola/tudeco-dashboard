import { z } from 'zod';

export const createMovementSchema = z
  .object({
    productId: z.coerce.number().int().positive(),
    type: z.enum(['ENTRY', 'EXIT', 'ADJUSTMENT']),
    quantity: z.coerce.number().int(),
    reason: z.string().trim().min(2).max(200).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.type === 'ADJUSTMENT') {
      if (value.quantity === 0) {
        ctx.addIssue({ code: 'custom', message: 'Una corrección no puede ser 0' });
      }
      return;
    }
    if (value.quantity <= 0) {
      ctx.addIssue({ code: 'custom', message: 'La cantidad debe ser mayor a 0' });
    }
  });

export const listMovementsQuerySchema = z.object({
  productId: z.coerce.number().int().positive().optional(),
  type: z.enum(['ENTRY', 'EXIT', 'ADJUSTMENT']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  take: z.coerce.number().int().min(1).max(100).default(20),
});

export const idParamSchema = z.coerce.number().int().positive();

export type CreateMovementInput = z.infer<typeof createMovementSchema>;
export type ListMovementsQuery = z.infer<typeof listMovementsQuerySchema>;
