import { z } from 'zod';

export const AuthSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  pin: z.string().min(1, 'PIN is required'),
});

export type IAuth = z.infer<typeof AuthSchema>;
