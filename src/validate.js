import { z } from 'zod';

const BookSchema = z.object({
  title: z.string().min(1),
  product_url: z.string().url(),
  price_text: z.string(),
  price_gbp: z.number().nonnegative(),
  availability_text: z.string(),
  rating_text: z.string(),
  description: z.string().nullable(),
  source_page: z.string().url(),
  fetched_at: z.string().datetime()
});

export function validateBook(record) {
  try {
    const validated = BookSchema.parse(record);
    return { valid: true, data: validated };
  } catch (err) {
    return { valid: false, error: err.errors };
  }
}
