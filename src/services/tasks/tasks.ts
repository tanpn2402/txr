import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { ConfigUtils } from "../../utils/config-utils";
import type { ITask } from "../../types/ITask";

type CreateTaskMutationOptions = UseMutationOptions<
  Awaited<ReturnType<typeof createTask>>,
  Error,
  Parameters<typeof createTask>[0],
  unknown
>;

export const createTask = (data: ITask) => {

   console.log('🚀 Line: 13 👈 🆚 👉 ==== n-console: data',data) 
  
  return new Promise<{ success: boolean }>((resolve) => {
    fetch(ConfigUtils.GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then(() => {
        resolve({ success: true });
      })
      .catch(() => {
        resolve({ success: false });
      });
  });
};

export const getCreateTaskMutationOption = (
  options: Omit<CreateTaskMutationOptions, "mutationFn">
) => {
  return {
    mutationFn: createTask,
    ...options,
  };
};

export const useCreateTask = (
  ...args: Parameters<typeof getCreateTaskMutationOption>
) => {
  return useMutation(getCreateTaskMutationOption(...args));
};
