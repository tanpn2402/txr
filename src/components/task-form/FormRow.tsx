import { Button, NativeSelect } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import dayjs from 'dayjs';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { useQueryProjects } from '@/services/projects/query-projects';
import type { IProject } from '@/services/projects/schema';
import type { ITask, ITaskForm } from '@/services/tasks/schema';
import type { FieldWithId } from '@/types/FieldWithId';
import type { FieldWithIndex } from '@/types/FieldWithIndex';
import { cn } from '@/utils/cn';

import { ComboBox } from '../commons/ComboBox';
import { FlexibleTextArea } from './FlexibleTextArea';

const FullHeightInput = {
  className: 'h-full',
  styles: {
    input: { height: '100%' },
    wrapper: { height: '100%' },
  },
};

export const FormRow: React.FC<{
  field: FieldWithId<FieldWithIndex<ITask>>;
  onRemove: () => void;
}> = ({ field: { index, ...field }, onRemove }) => {
  const { control } = useFormContext<ITaskForm>();
  const isEditable = !!field.createdAt;

  const { data: projects } = useQueryProjects();

  return (
    <div
      key={field.id}
      className={cn([
        'grid grid-cols-[160px_160px_220px_160px_1fr_100px] items-start gap-0',
        '[&_select]:not-focus-within:border-l-transparent!',
        '[&_button]:not-focus-within:border-l-transparent!',
      ])}
    >
      <Controller
        name={`tasks.${index}.project`}
        control={control}
        render={({ field: { value, onChange } }) => {
          return (
            <div className="h-full">
              <ComboBox<IProject>
                inputProps={{
                  size: 'lg',
                  disabled: isEditable,
                  ...FullHeightInput,
                }}
                value={value}
                onChange={(val) => {
                  onChange(val);
                }}
                options={projects || []}
                labelField="name"
                valueField="id1"
              />
            </div>
          );
        }}
      />
      <Controller
        name={`tasks.${index}.date`}
        control={control}
        render={({ field: { value, onChange } }) => {
          return (
            <div className="h-full">
              <DatePickerInput
                valueFormat="YYYY-MM-DD"
                value={dayjs(value).toDate()}
                onChange={onChange}
                size="lg"
                {...FullHeightInput}
              />
            </div>
          );
        }}
      />
      <Controller
        name={`tasks.${index}.status`}
        control={control}
        render={({ field: { value, onChange } }) => {
          return (
            <div className="h-full">
              <NativeSelect
                size="lg"
                value={value}
                onChange={onChange}
                data={['In Progress', 'Development Done']}
                disabled={isEditable}
                {...FullHeightInput}
              />
            </div>
          );
        }}
      />
      <Controller
        control={control}
        name={`tasks.${index}.jiraId`}
        render={({ field }) => {
          return (
            <FlexibleTextArea
              autosize
              size="lg"
              {...field}
              {...FullHeightInput}
              disabled={isEditable}
            />
          );
        }}
      />
      <Controller
        control={control}
        name={`tasks.${index}.description`}
        render={({ field }) => {
          return (
            <FlexibleTextArea
              autosize
              size="lg"
              {...field}
              {...FullHeightInput}
              disabled={isEditable}
            />
          );
        }}
      />
      <div className="flex h-full items-center justify-end">
        <Button
          type="button"
          color="gray"
          variant="outline"
          size="xs"
          className="h-full! w-full! border-[#ced4da]! border-l-transparent!"
          onClick={onRemove}
          disabled={isEditable}
        >
          Remove
        </Button>
      </div>
    </div>
  );
};
