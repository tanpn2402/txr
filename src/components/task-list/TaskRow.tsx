import { Button, Checkbox } from '@mantine/core';
import dayjs from 'dayjs';
import type React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import type { ITask } from '@/services/tasks/schema';
import type { FieldWithUniqId } from '@/types/FieldWithUniqId';
import { cn } from '@/utils/cn';
import { getStartOfWeek } from '@/utils/date-utils';

export const TaskRow: React.FC<{
  selected: boolean;
  task: FieldWithUniqId<ITask>;
  onCopy: (task: ITask) => void;
  onToggleTask: (task: ITask, checked: boolean) => void;
}> = ({ task, selected, onCopy, onToggleTask }) => {
  const { control } = useFormContext<{
    selectedTasks: ITask[];
  }>();

  return (
    <div
      key={`${task.jiraId}#${task.createdAt}#${task.uniId}`}
      className={cn([
        'min-h-10 border border-[#ced4da]',
        'grid grid-cols-[38px_120px_160px_220px_160px_1fr_100px] items-start gap-0 border-l border-l-[#ced4da]',
        '[&_button]:not-focus-within:border-transparent!',
      ])}
    >
      <div className="h-full border-r border-r-[#ced4da] p-2">
        <Controller
          control={control}
          name="selectedTasks"
          render={() => (
            <Checkbox checked={selected} onChange={(e) => onToggleTask(task, e.target.checked)} />
          )}
        />
      </div>
      <div className="h-full border-r border-r-[#ced4da] p-2">{task.project?.name}</div>
      <div className="h-full border-r border-r-[#ced4da] p-2">
        {dayjs(task.date).format('YYYY-MM-DD')}
      </div>
      <div className="h-full border-r border-r-[#ced4da] p-2">{task.status}</div>
      <div className="h-full border-r border-r-[#ced4da] p-2">{task.jiraId}</div>
      <div className="h-full border-r border-r-[#ced4da] p-2">{task.description}</div>
      <div className="h-full">
        <Button
          type="button"
          color="gray"
          variant="outline"
          size="xs"
          className="h-full! w-full! border-[#ced4da]! border-l-transparent!"
          onClick={() => {
            const { date, ...t } = task;
            onCopy({
              ...t,
              createdAt: null,
              date: dayjs(date).format('YYYY-MM-DD'),
              startWeekDate: getStartOfWeek(date),
            });
          }}
        >
          Copy
        </Button>
      </div>
    </div>
  );
};
