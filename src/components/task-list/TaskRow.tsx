import { Button, Checkbox, Popover, Tooltip, type TooltipProps } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import type React from 'react';
import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { useDeleteTasks } from '@/services/tasks/delete-tasks';
import { getTasksQueryOptions } from '@/services/tasks/query-tasks';
import type { ITask } from '@/services/tasks/schema';
import type { FieldWithUniqId } from '@/types/FieldWithUniqId';
import { cn } from '@/utils/cn';
import { getStartOfWeek } from '@/utils/date-utils';

import { CheckIcon } from '../icons/CheckIcon';
import { CopyIcon } from '../icons/CopyIcon';
import { TrashIcon } from '../icons/TrashIcon';

const TooltipProps: Partial<TooltipProps> = {
  withArrow: true,
  transitionProps: { transition: 'pop-bottom-left', duration: 200 },
  arrowSize: 8,
  color: 'white',
  className: 'border border-[#ced4da] text-black! shadow-lg [&_div]:bg-[#ced4da]!',
};

const TableCellProps = {
  className: 'h-full border-r border-r-[#ced4da] p-2',
};

export const TaskRow: React.FC<{
  selected: boolean;
  task: FieldWithUniqId<ITask>;
  onCopy: (task: ITask) => void;
  onToggleTask: (task: ITask, checked: boolean) => void;
}> = ({ task, selected, onCopy, onToggleTask }) => {
  const queryClient = useQueryClient();

  const [opened, setOpened] = useState(false);

  const { control } = useFormContext<{
    selectedTasks: ITask[];
  }>();

  const { mutateAsync, isPending, isSuccess } = useDeleteTasks({
    onSuccess: () => {
      notifications.show({
        color: 'teal',
        message: 'Task record has been deleted.',
      });
      queryClient.invalidateQueries({
        queryKey: getTasksQueryOptions({
          startWeekDate: getStartOfWeek(task.date),
        }).queryKey,
      });
    },
    onError: () => {
      notifications.show({
        color: 'red',
        message: 'Failed to delete, please try again after 5 seconds.',
      });
    },
  });

  const handleDelete = async () => {
    try {
      if (task.uniId)
        await mutateAsync([
          {
            uniId: task.uniId,
            startWeekDate: task.startWeekDate,
          },
        ]);
    } finally {
      setOpened(false);
    }
  };

  if (isSuccess) {
    return null;
  }

  return (
    <div
      key={`${task.jiraId}#${task.createdAt}#${task.uniId}`}
      className={cn([
        'min-h-10 border border-[#ced4da]',
        'grid grid-cols-[38px_120px_160px_220px_160px_1fr_80px] items-start gap-0 border-l border-l-[#ced4da]',
        '[&_button]:not-focus-within:border-transparent!',
      ])}
    >
      <div {...TableCellProps}>
        <Controller
          control={control}
          name="selectedTasks"
          render={() => (
            <Checkbox checked={selected} onChange={(e) => onToggleTask(task, e.target.checked)} />
          )}
        />
      </div>
      <div {...TableCellProps}>{task.project?.name}</div>
      <div {...TableCellProps}>{dayjs(task.date).format('YYYY-MM-DD')}</div>
      <div {...TableCellProps}>{task.status}</div>
      <div {...TableCellProps}>{task.jiraId}</div>
      <div {...TableCellProps}>{task.description}</div>
      <div className="flex h-full">
        <Tooltip label="Copy" {...TooltipProps}>
          <Button
            type="button"
            color="gray"
            variant="outline"
            size="xs"
            className="h-full! w-full! border-[#ced4da]! border-l-transparent! p-0!"
            onClick={() => {
              const { date, ...t } = task;
              onCopy({
                ...t,
                createdAt: null,
                date: dayjs(date).format('YYYY-MM-DD'),
                startWeekDate: getStartOfWeek(date),
              });
            }}
            disabled={isPending}
          >
            <CopyIcon className="h-4 w-4" />
          </Button>
        </Tooltip>
        <Popover
          position="bottom-end"
          withArrow
          arrowSize={20}
          shadow="md"
          opened={opened}
          onDismiss={() => setOpened(false)}
        >
          <Popover.Target>
            <Tooltip label="Delete" {...TooltipProps}>
              <Button
                type="button"
                color="gray"
                variant="outline"
                size="xs"
                className="h-full! w-full! border-[#ced4da]! border-l-transparent! p-0!"
                onClick={() => setOpened((prevVal) => !prevVal)}
                disabled={isPending}
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </Tooltip>
          </Popover.Target>
          <Popover.Dropdown>
            <div className="flex items-center gap-4">
              <div>
                <h3>Are you sure?</h3>
                <p className="text-xs italic">This record will be never recoverable.</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="compact-xs"
                color="red"
                className={isPending ? 'border-[#ced4da]!' : 'border-red-500!'}
                onClick={handleDelete}
                disabled={isPending}
              >
                <CheckIcon />
              </Button>
            </div>
          </Popover.Dropdown>
        </Popover>
      </div>
    </div>
  );
};
