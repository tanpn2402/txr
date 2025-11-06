import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { callGoogleScript } from '@/utils/gs';
import { tokenStorage } from '@/utils/storage-utils';

type DeleteTaskMutationOptions = UseMutationOptions<
  Awaited<ReturnType<typeof deleteTasks>>,
  Error,
  Parameters<typeof deleteTasks>[0],
  unknown
>;

export const deleteTasks = async (taskIds: Array<{ uniId: string; startWeekDate: string }>) => {
  const response = await callGoogleScript<{
    action: string;
    token: string | null;
    body: Array<{ uniId: string; startWeekDate: string }>;
  }>('callAction', {
    action: 'DELETE_TASKS',
    body: taskIds,
    token: await tokenStorage.getAccessToken(),
  });

  if (!response.success) {
    throw Error(typeof response.error === 'string' ? response.error : response.error?.message);
  }

  return response;
};

export const getDeleteTaskMutationOptions = (
  options: Omit<DeleteTaskMutationOptions, 'mutationFn'>
) => {
  return {
    mutationFn: deleteTasks,
    ...options,
  };
};

export const useDeleteTasks = (...args: Parameters<typeof getDeleteTaskMutationOptions>) => {
  return useMutation(getDeleteTaskMutationOptions(...args));
};
