import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { callGoogleScript } from '@/utils/gs';
import { isNullStr } from '@/utils/string-utils';

type GetTaskQueryOptions = UseQueryOptions<
  Awaited<ReturnType<typeof getTasks>>,
  Error,
  Awaited<ReturnType<typeof getTasks>>
>;

function generateUniqueId({ id = '' }, index = 0) {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  const timestamp = now.getTime().toString(36); // base36 timestamp
  return `${datePart}#${id}#${index}#${timestamp}`;
}

const convertToTasks = (values: string[], index: number) => {
  const [
    id,
    name,
    project,
    projectId,
    date,
    jiraId,
    description,
    status,
    remark,
    createdAt,
    uniId,
  ] = values;
  return {
    id: String(id ?? ''),
    name: String(name ?? ''),
    date,
    jiraId: String(jiraId),
    description: String(description),
    status: String(status),
    remark: String(remark ?? ''),
    createdAt,
    uniId: isNullStr(uniId) ? generateUniqueId({ id }, index) : uniId,
    project: {
      name: String(project ?? ''),
      id1: String(projectId ?? ''),
      id2: '',
    },
  };
};

export const getTasks = async (query: { startWeekDate: string }) => {
  const response = await callGoogleScript<string, string[][]>(
    'getSheetData',
    `R-${query.startWeekDate}`
  );

  if (!response.success) {
    throw [];
  } else {
    return response.data?.map(convertToTasks);
  }
};

export const getTasksQueryOptions = (...args: Parameters<typeof getTasks>): GetTaskQueryOptions => {
  return {
    queryKey: ['TASKS', ...args],
    queryFn: () => getTasks(...args),
    retry: 0,
  };
};

export const useQueryTasks = (...args: Parameters<typeof getTasksQueryOptions>) => {
  return useQuery(getTasksQueryOptions(...args));
};
