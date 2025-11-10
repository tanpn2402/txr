import { z } from 'zod';

export const LoginFormSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  pin: z.string().min(4, 'PIN is required'),
});

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  token: z.string(),
});

export type ILoginForm = z.infer<typeof LoginFormSchema>;
export type IUser = z.infer<typeof UserSchema>;
