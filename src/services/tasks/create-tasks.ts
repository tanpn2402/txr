import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import dayjs from 'dayjs';

import { getStartOfWeek } from '@/utils/date-utils';
import { callGoogleScript } from '@/utils/gs';
import { tokenStorage } from '@/utils/storage-utils';

import type { ITask, ITaskForm } from './schema';

type CreateTaskMutationOptions = UseMutationOptions<
  Awaited<ReturnType<typeof createTasks>>,
  Error,
  Parameters<typeof createTasks>[0],
  unknown
>;

export const createTasks = async (form: ITaskForm) => {
  const response = await callGoogleScript<{
    action: string;
    token: string | null;
    body: ITaskForm['tasks'];
  }>('callAction', {
    action: 'CREATE_TASKS',
    body: form.tasks,
    token: await tokenStorage.getAccessToken(),
  });

  if (!response.success) {
    throw Error(typeof response.error === 'string' ? response.error : response.error?.message);
  }

  return response;
};

export const getCreateTaskMutationOptions = (
  options: Omit<CreateTaskMutationOptions, 'mutationFn'>
) => {
  return {
    mutationFn: createTasks,
    ...options,
  };
};

export const useCreateTasks = (...args: Parameters<typeof getCreateTaskMutationOptions>) => {
  return useMutation(getCreateTaskMutationOptions(...args));
};

export const createDefaultTask = (date?: string, defaultProject?: ITask['project']): ITask => {
  return {
    date: date || dayjs().format('YYYY-MM-DD'),
    jiraId: '',
    description: '',
    status: 'In Progress',
    startWeekDate: getStartOfWeek(),
    project: defaultProject,
  };
};
