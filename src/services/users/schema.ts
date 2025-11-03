import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  token: z.string(),
});

export type IUser = z.infer<typeof UserSchema>;
