import { Button, Skeleton } from '@mantine/core';
import type React from 'react';
import { useFormContext } from 'react-hook-form';

import type { ITask } from '@/services/tasks/schema';

import { useTaskList } from './TaskListProvider';
import { TaskRow } from './TaskRow';

export const TaskListByWeek: React.FC<{
  startWeekDate: string;
  id: string;
  isLastPage?: boolean;
  onCopy: (task: ITask) => void;
  onToggleTask: (task: ITask, checked: boolean) => void;
}> = ({ id, startWeekDate, isLastPage, onCopy, onToggleTask }) => {
  const { tasks, isLoading, loadMore } = useTaskList({ id, startWeekDate });

  const { watch } = useFormContext<{
    selectedTasks: ITask[];
  }>();

  const selectedTasks = watch('selectedTasks');

  if (isLoading) {
    return (
      <div className="mt-3">
        <Skeleton height={44} />
        <Skeleton height={44} mt={12} />
      </div>
    );
  }

  return (
    <>
      {tasks.map((task) => (
        <TaskRow
          key={`${task.jiraId}#${task.createdAt}#${task.uniId}`}
          onCopy={onCopy}
          onToggleTask={onToggleTask}
          selected={selectedTasks.some(({ uniId }) => task.uniId === uniId)}
          task={task}
        />
      ))}
      {isLastPage ? (
        <div className="my-8 flex justify-center">
          <Button type="button" color="gray" variant="outline" size="xs" w={200} onClick={loadMore}>
            Load
          </Button>
        </div>
      ) : null}
    </>
  );
};
