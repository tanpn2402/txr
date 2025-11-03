import { Button, Checkbox, Modal, Skeleton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import dayjs from 'dayjs';
import type React from 'react';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { useQueryTasks } from '@/services/tasks/query-tasks';
import type { ITask } from '@/services/tasks/schema';
import { cn } from '@/utils/cn';
import { getOpsScript } from '@/utils/ops-scripting';

type FormValues = {
  selectedTasks: ITask[];
};

export const TaskList: React.FC<{
  startWeekDate: string;
  id: string;
  onCopy: (task: ITask) => void;
}> = ({ id, startWeekDate, onCopy }) => {
  const [opened, { open, close }] = useDisclosure(false);

  const { data, isLoading } = useQueryTasks({ id, startWeekDate });

  const tasks = useMemo<ITask[]>(
    () =>
      (data || [])
        .filter((task) => task.id === id)
        .map((task) => ({
          ...task,
          startWeekDate,
        })),
    [id, startWeekDate, data]
  );

  const { control, handleSubmit, watch, setValue } = useForm<FormValues>({
    defaultValues: {
      selectedTasks: [],
    },
  });

  const selectedTasks = watch('selectedTasks');
  const opsScript = useMemo(() => getOpsScript(selectedTasks), [selectedTasks]);

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

  const handleCopy = async (ev: React.MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => {
    try {
      const text = getOpsScript(selectedTasks);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      (ev.target as HTMLElement).innerHTML = 'Copied';
      setTimeout(() => {
        (ev.target as HTMLElement).innerHTML = 'Copy';
      }, 5_000);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  const handleOpenOPS = () => {
    window.open('https://ops.tx-tech.com/ess/Timesheet/List?approvalStatus=1', '_blank');
  };

  if (isLoading) {
    return (
      <div className="mt-20">
        <Skeleton height={44} />
        <Skeleton height={44} mt={12} />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mt-20 mb-2 flex gap-4">
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
      </div>
      <div className={cn(['min-h-20 w-full text-sm text-gray-700'])}>
        {tasks.map((task) => (
          <div
            key={`${task.jiraId}#${task.createdAt}#${task.uniId}`}
            className={cn([
              'min-h-10 border border-[#ced4da]',
              'grid grid-cols-[38px_160px_220px_160px_1fr_100px] items-start gap-0 border-l border-l-[#ced4da]',
              '[&_button]:not-focus-within:border-transparent!',
            ])}
          >
            <div className="h-full border-r border-r-[#ced4da] p-2">
              <Controller
                control={control}
                name="selectedTasks"
                render={() => (
                  <Checkbox
                    checked={selectedTasks.some(({ uniId }) => task.uniId === uniId)}
                    onChange={(e) => toggleTask(task, e.target.checked)}
                  />
                )}
              />
            </div>
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
                    startWeekDate,
                  });
                }}
              >
                Copy
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Modal opened={opened} onClose={close} title="OPS script" centered size="auto">
        <pre className="text-xs">{opsScript}</pre>

        <div className="sticky bottom-0 mt-4 flex justify-end gap-4 bg-white py-2">
          <Button variant="light" onClick={handleCopy}>
            Copy
          </Button>
          <Button variant="outline" onClick={handleOpenOPS}>
            Open OPS
          </Button>
        </div>
      </Modal>
    </form>
  );
};
