import dayjs from 'dayjs';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { useQueryProjects } from '@/services/projects/query-projects';
import { type IProject } from '@/services/projects/schema';
import { useQueryTasks } from '@/services/tasks/query-tasks';
import type { ITask } from '@/services/tasks/schema';

interface TaskListContextType {
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loadMore: () => void;
}

const TaskListContext = createContext<TaskListContextType | undefined>(undefined);

export const TaskListProvider: React.FC<
  React.PropsWithChildren & {
    loadMore: () => void;
  }
> = ({ children, loadMore }) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <TaskListContext.Provider value={{ isLoading, loadMore, setIsLoading }}>
      {children}
    </TaskListContext.Provider>
  );
};

function useTaskList({ id, startWeekDate }: { startWeekDate: string; id: string }) {
  const ctx = useContext(TaskListContext);
  const { data: projects } = useQueryProjects();
  const projectsMap = useMemo(
    () =>
      projects?.reduce<Record<string, IProject>>((acc, project) => {
        acc[project.id1] = project;
        return acc;
      }, {}),
    [projects]
  );

  const { data, isLoading } = useQueryTasks({ startWeekDate });
  const tasks = useMemo<ITask[]>(
    () =>
      (data || [])
        .filter((task) => task.id === id)
        .map((task) => ({
          ...task,
          startWeekDate,
          project: {
            ...task.project,
            ...(projectsMap?.[task.project.id1]
              ? {
                  name: projectsMap?.[task.project.id1].name,
                  id2: projectsMap?.[task.project.id1].id2,
                }
              : {}),
          },
        }))
        .sort((a, b) => (dayjs(a.date).isAfter(dayjs(b.date)) ? 1 : -1)),
    [id, startWeekDate, projectsMap, data]
  );

  useEffect(() => {
    ctx?.setIsLoading(isLoading);
  }, [isLoading, ctx]);

  return {
    tasks,
    isLoading,
    loadMore: ctx?.loadMore,
  };
}

export { useTaskList };
