import { Button, Checkbox, Modal } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import type React from 'react';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';

import type { ITask } from '@/services/tasks/schema';
import { getOpsScript } from '@/utils/ops-scripting';

type FormValues = {
  isAutoSubmit: boolean;
};

export const OpsScriptModal: React.FC<{
  tasks: ITask[];
  opened: boolean;
  onClose: () => void;
}> = ({ tasks, opened, onClose }) => {
  const methods = useForm<FormValues>({
    defaultValues: {},
  });
  const { handleSubmit, watch, control } = methods;

  const values = watch();

  const opsScript = useMemo(() => getOpsScript(tasks, values), [tasks, values]);

  const handleOpenOPS = () => {
    window.open('https://ops.tx-tech.com/ess/Timesheet/List?approvalStatus=1', '_blank');
  };

  const onSubmit = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(opsScript);
      } else {
        const ta = document.createElement('textarea');
        ta.value = opsScript;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      notifications.show({
        color: 'teal',
        message: 'Copied!',
        position: 'top-right',
      });
    } catch (err) {
      console.error('Copy failed', err);
      notifications.show({
        color: 'red',
        message: 'Failed to copied, may be permission issue',
        position: 'top-right',
      });
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="OPS script" centered size="auto">
      <form onSubmit={handleSubmit(onSubmit)}>
        <pre className="text-xs">{opsScript}</pre>
        <div className="sticky bottom-0 bg-white py-2">
          <div className="flex justify-end py-4">
            <Controller
              control={control}
              name="isAutoSubmit"
              render={({ field: { value, onChange } }) => (
                <Checkbox
                  checked={value}
                  onChange={(e) => onChange(e.target.checked)}
                  label="Auto submit?"
                />
              )}
            />
          </div>
          <div className="flex justify-end gap-4">
            <Button type="submit" variant="light">
              Copy
            </Button>
            <Button variant="outline" onClick={handleOpenOPS}>
              Open OPS
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
