import { z } from 'zod';

import { ProjectSchema } from '../projects/schema';
import { UserSchema } from '../users/schema';

export const TaskSchema = z.object({
  date: z.string(),
  jiraId: z.string().optional(),
  description: z.string().optional(),
  status: z.string().optional(),
  startWeekDate: z.string(),
  createdAt: z.string().optional().nullable(),
  uniId: z.string().optional().nullable(),
  project: ProjectSchema.optional(),
});

export const TaskFormSchema = z.object({
  tasks: z.array(TaskSchema).min(1, 'At least one task is required'),
  user: UserSchema,
});

export type ITask = z.infer<typeof TaskSchema>;
export type ITaskForm = z.infer<typeof TaskFormSchema>;
