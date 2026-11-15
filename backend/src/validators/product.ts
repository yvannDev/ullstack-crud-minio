import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(3000).default(''),
  price: z.coerce.number().finite().min(0).max(999999999)
});
