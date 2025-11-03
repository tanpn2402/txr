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
  const [id, name, date, jiraId, description, status, remark, createdAt, uniId] = values;
  return {
    id,
    name,
    date,
    jiraId,
    description,
    status,
    remark,
    createdAt,
    uniId: isNullStr(uniId) ? generateUniqueId({ id }, index) : uniId,
  };
};

export const getTasks = async (query: { startWeekDate: string; id: string }) => {
  const response = await callGoogleScript<string, string[][]>(
    'getSheetData',
    `R-${query.startWeekDate}`
  );

  if (!response.success) {
    throw Error(typeof response.error === 'string' ? response.error : response.error?.message);
  } else {
    return response.data?.map(convertToTasks);
  }
};

export const getTasksQueryOptions = (...args: Parameters<typeof getTasks>): GetTaskQueryOptions => {
  return {
    queryKey: ['TASKS'],
    queryFn: () => getTasks(...args),
  };
};

export const useQueryTasks = (...args: Parameters<typeof getTasksQueryOptions>) => {
  return useQuery(getTasksQueryOptions(...args));
};
