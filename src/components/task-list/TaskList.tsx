import { Button, NativeSelect } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import dayjs from 'dayjs';
import type React from 'react';
import { useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import type { ITask } from '@/services/tasks/schema';
import { useQueryUsers } from '@/services/users/query-users';
import type { IUser } from '@/services/users/schema';
import { cn } from '@/utils/cn';
import { getStartOfWeek } from '@/utils/date-utils';

import { useAuthGuard } from '../guards/AuthGuard';
import { OpsScriptModal } from '../ops/OpsScriptModal';
import { TaskListByWeek } from './TaskListByWeek';
import { TaskListProvider } from './TaskListProvider';

type FormValues = {
  selectedTasks: ITask[];
};

export const TaskList: React.FC<{
  onCopy: (task: ITask) => void;
}> = ({ onCopy }) => {
  const { userId: loggedUserId, role } = useAuthGuard();
  const [userId, setUserId] = useState(loggedUserId);

  const [opened, { open, close }] = useDisclosure(false);

  const [weeks, setWeeks] = useState([
    getStartOfWeek(),
    getStartOfWeek(dayjs().subtract(7, 'days').toDate()),
  ]);

  const { data, isLoading } = useQueryUsers();
  const { usersOptions } = useMemo(() => {
    const usersSet = new Set<string>();
    const usersMap = (data ?? []).reduce<Record<string, IUser>>((acc, user) => {
      acc[user.id] = user;
      usersSet.add(user.id);
      return acc;
    }, {});
    return {
      usersMap,
      usersOptions: ['---', ...usersSet],
    };
  }, [data]);

  const methods = useForm<FormValues>({
    defaultValues: {
      selectedTasks: [],
    },
  });
  const { handleSubmit, watch, setValue } = methods;

  const selectedTasks = watch('selectedTasks');

  const toggleTask = (task: ITask, checked: boolean) => {
    if (checked) {
      setValue('selectedTasks', [...selectedTasks, task]);
    } else {
      setValue(
        'selectedTasks',
        selectedTasks.filter(({ uniId }) => task.uniId !== uniId)
      );
    }
  };

  const onSubmit = () => {
    open();
  };

  const handleLoadMoreTasks = () => {
    setWeeks((prevValues) => [
      ...prevValues,
      getStartOfWeek(dayjs(prevValues.at(-1)).subtract(7, 'days').toDate()),
    ]);
  };

  if (!userId) return null;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="sticky top-0 z-10 mt-20 mb-2 flex gap-4 bg-white py-6">
          <h2 className="text-xl">History</h2>
          <Button
            type="submit"
            color="gray"
            variant="outline"
            size="xs"
            disabled={!selectedTasks.length}
          >
            Generate OPS script
          </Button>
          <div className="flex-1" />
          {role === 'ADMIN' ? (
            <NativeSelect
              size="xs"
              className="min-w-52"
              value={userId ?? ''}
              onChange={(ev) => setUserId(ev.target.value)}
              data={usersOptions}
              disabled={isLoading}
            />
          ) : null}
        </div>
        <TaskListProvider loadMore={handleLoadMoreTasks}>
          <div className={cn(['min-h-20 w-full text-sm text-gray-700'])}>
            {weeks.map((week, index) => (
              <TaskListByWeek
                key={`task-week-${week}`}
                startWeekDate={week}
                id={userId}
                onCopy={onCopy}
                onToggleTask={toggleTask}
                isLastPage={index === weeks.length - 1}
              />
            ))}
          </div>
        </TaskListProvider>
        <OpsScriptModal opened={opened} onClose={close} tasks={selectedTasks} />
      </form>
    </FormProvider>
  );
};
