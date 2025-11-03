import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { callGoogleScript } from '@/utils/gs';

import type { IUser } from './schema';

type GetUsersQueryOptions = UseQueryOptions<
  IUser[] | undefined,
  Error,
  Parameters<typeof getUsers>
>;

const convertToUsers = (values: string[]) => {
  const [id, name, token] = values;
  return { id, name, token };
};

export const getUsers = async (): Promise<IUser[] | undefined> => {
  const response = await callGoogleScript<string, string[][]>('getSheetData', 'MEMBERS');

  if (!response.success) {
    throw Error(typeof response.error === 'string' ? response.error : response.error?.message);
  } else {
    return response.data?.map(convertToUsers);
  }
};

export const getUsersQueryOptions = (
  ...args: Parameters<typeof getUsers>
): GetUsersQueryOptions => {
  return {
    queryKey: ['USERS'],
    queryFn: () => getUsers(...args),
  };
};

export const useQueryUsers = (...args: Parameters<typeof getUsersQueryOptions>) => {
  return useQuery({
    queryKey: ['USERS'],
    queryFn: () => getUsers(...args),
  });
};
