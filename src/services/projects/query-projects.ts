import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { callGoogleScript } from '@/utils/gs';

type GetTaskQueryOptions = UseQueryOptions<
  Awaited<ReturnType<typeof getProjects>>,
  Error,
  Awaited<ReturnType<typeof getProjects>>
>;

const convertToProject = (values: string[]) => {
  const [name, id1, id2, isEnabled, isDefault] = values;
  return {
    name,
    id1,
    id2,
    isEnabled: isEnabled ?? 'N',
    isDefault: isDefault ?? 'N',
  };
};

export const getProjects = async () => {
  const response = await callGoogleScript<string, string[][]>('getSheetData', 'PROJECTS');

  if (!response.success) {
    throw Error(typeof response.error === 'string' ? response.error : response.error?.message);
  } else {
    return response.data?.map(convertToProject).filter(({ isEnabled }) => isEnabled === 'Y');
  }
};

export const getProjectsQueryOptions = (
  ...args: Parameters<typeof getProjects>
): GetTaskQueryOptions => {
  return {
    queryKey: ['PROJECTS', ...args],
    queryFn: () => getProjects(...args),
  };
};

export const useQueryProjects = (...args: Parameters<typeof getProjectsQueryOptions>) => {
  return useQuery(getProjectsQueryOptions(...args));
};
