import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Code, Loader } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo } from 'react';
import {
  type FieldErrors,
  FormProvider,
  useFieldArray,
  useForm,
} from 'react-hook-form';

import { useDebounceFn } from '@/hooks/useDebounceFn';
import { useQueryProjects } from '@/services/projects/query-projects';
import { createDefaultTask, useCreateTasks } from '@/services/tasks/create-tasks';
import { getTasksQueryOptions } from '@/services/tasks/query-tasks';
import { type ITask, type ITaskForm,TaskFormSchema } from '@/services/tasks/schema';
import { useQueryUsers } from '@/services/users/query-users';
import { getStartOfWeek } from '@/utils/date-utils';
import { taskStorage } from '@/utils/storage-utils';
import { isNullStr } from '@/utils/string-utils';

import { useAuthGuard } from '../guards/AuthGuard';
import { TaskList } from '../task-list/TaskList';
import { FormRow } from './FormRow';

const TaskForm = () => {
  const { userId, clearAuthGuard } = useAuthGuard();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQueryUsers();
  const { data: projects } = useQueryProjects();

  const defaultProject = useMemo(
    () => (projects || []).find(({ isDefault }) => isDefault === 'Y') || projects?.[0],
    [projects]
  );

  const methods = useForm({
    resolver: zodResolver(TaskFormSchema),
    defaultValues: {
      tasks: [createDefaultTask(undefined, defaultProject)],
    },
  });

  const { control, getValues, handleSubmit, reset, watch } = methods;

  const { fields, append, remove } = useFieldArray({ control, name: 'tasks' });

  const tasks = watch('tasks');
  const user = watch('user');

  const mutation = useCreateTasks({
    onSuccess: () => {
      notifications.show({
        color: 'teal',
        message: 'Your report has been submitted. Thanks for your time. Bye!',
      });
      clearForm([createDefaultTask(undefined, defaultProject)]);
      queryClient.invalidateQueries({
        queryKey: getTasksQueryOptions({
          startWeekDate: getStartOfWeek(),
        }).queryKey,
      });
    },
    onError: () => {
      notifications.show({
        color: 'red',
        message: 'Failed to submit, please try again after 5 seconds.',
      });
    },
  });

  const clearForm = (tasks: ITask[]) => {
    reset((prevValues) => ({
      ...prevValues,
      tasks: tasks.length === 0 ? [createDefaultTask(undefined, defaultProject)] : tasks,
    }));
    taskStorage.save(tasks);
  };

  const onSubmit = (data: ITaskForm) => {
    const tasks = data.tasks
      .filter((task) => !(isNullStr(task.jiraId) && isNullStr(task.description)))
      .map((task) => ({
        ...task,
        startWeekDate: getStartOfWeek(task.date),
      }));

    clearForm(tasks);

    if (tasks.length) {
      mutation.mutate({
        tasks,
        user: data.user,
      });
    } else {
      notifications.show({
        message: "You haven't worked today, have you?",
      });
    }
  };

  const onError = (errors: FieldErrors<ITaskForm>) => {
    if (errors.user) {
      notifications.show({
        color: 'red',
        message: 'Who are you?',
      });
    }
  };

  const initialLoad = useCallback(async () => {
    const tasks = await taskStorage.get();
    if (tasks?.length) {
      reset((prevValues) => ({
        ...prevValues,
        tasks,
      }));
    }
  }, [reset]);

  useDebounceFn(
    tasks,
    (tasks) => {
      taskStorage.save(tasks);
    },
    5_000
  );

  useEffect(() => {
    if (users?.length) {
      const currentUser = users.find(({ id }) => id === userId);
      if (currentUser) {
        reset((prevVal) => ({
          ...prevVal,
          user: currentUser,
        }));
      }
    }
  }, [reset, userId, users]);

  useEffect(() => {
    initialLoad();
  }, [initialLoad]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-0">
        <div className="mb-4 flex items-center gap-2">
          {isLoading || !user ? (
            <Loader color="gray" size={34} />
          ) : (
            <>
              <h2 className="text-2xl">
                Hi <Code className="text-2xl!">{user?.name ?? '<no-name/>'}</Code>{' '}
              </h2>
              <Button
                variant="outline"
                color="gray"
                type="button"
                size="compact-xs"
                onClick={clearAuthGuard}
              >
                Logout
              </Button>
            </>
          )}
        </div>
        <div className="grid grid-cols-[160px_160px_220px_160px_1fr] items-start gap-0 text-sm text-slate-400 italic [&_p]:px-2">
          <p>Project</p>
          <p>Date</p>
          <p>Status</p>
          <p>Jira</p>
          <p>Description</p>
        </div>
        {fields.map((field, index) => (
          <FormRow
            key={`Row#${String.fromCharCode(index + 65)}`}
            field={{ ...field, index }}
            onRemove={() => {
              remove(index);
              if (fields.length === 1) {
                clearForm([createDefaultTask(undefined, defaultProject)]);
              }
            }}
            onCopy={() => {
              append(getValues(`tasks.${index}`));
            }}
          />
        ))}

        {user?.id ? <TaskList id={user.id} onCopy={(task) => append(task)} /> : null}

        <div className="mt-4 flex items-center justify-end gap-4">
          <Button
            variant="outline"
            color="gray"
            type="button"
            size="lg"
            disabled={mutation.isPending}
            onClick={() => {
              clearForm([createDefaultTask(undefined, defaultProject)]);
            }}
          >
            Clear all
          </Button>

          <Button
            variant="outline"
            color="gray"
            type="button"
            size="lg"
            disabled={mutation.isPending}
            onClick={() => append(createDefaultTask(undefined, defaultProject))}
          >
            + Add New
          </Button>

          <Button
            type="submit"
            disabled={mutation.isPending}
            className="min-w-24"
            size="lg"
            w={200}
          >
            {mutation.isPending ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export { TaskForm };
