import { z } from 'zod';

export const CreateExpenseSchema = z.object({
  description: z.string().min(1, 'Description is required').max(500),
  amount: z.number().positive('Amount must be positive'),
  date: z.date(),
  categoryId: z.string().uuid('Invalid category ID')
});

export const UpdateExpenseSchema = z.object({
  description: z.string().min(1, 'Description is required').max(500),
  amount: z.number().positive('Amount must be positive'),
  date: z.date(),
  categoryId: z.string().uuid('Invalid category ID')
});

export type CreateExpenseInput = z.infer<typeof CreateExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof UpdateExpenseSchema>;
