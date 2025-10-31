import { z } from "zod";

/* ✅ Define Zod schema */
export const TaskSchema = z.object({
  jiraId: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  status: z
    .enum(["In Progress", "Development Done", "Open"])
    .default("In Progress"),
  type: z.enum(["Issue", "Plan"]).default("Issue"),
});

export const TaskFormSchema = z.object({
  tasks: z.array(TaskSchema).min(1, "At least one task is required"),
});
