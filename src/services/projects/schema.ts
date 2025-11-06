import { z } from 'zod';

export const ProjectSchema = z.object({
  name: z.string(),
  id1: z.string(),
  id2: z.string(),
  isEnabled: z.string().optional().nullable(),
  isDefault: z.string().optional().nullable(),
});

export type IProject = z.infer<typeof ProjectSchema>;
