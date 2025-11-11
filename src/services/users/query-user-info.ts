import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useAuthGuard } from '@/components/guards/AuthGuard';
import { callGoogleScript } from '@/utils/gs';
import { tokenStorage } from '@/utils/storage-utils';
import { isNullStr } from '@/utils/string-utils';

import { useQueryUsers } from './query-users';

type GetUserInfoQueryOptions = UseQueryOptions<
  Awaited<ReturnType<typeof getUserInfo>>,
  Error,
  Parameters<typeof getUserInfo>[0]
>;

export const getUserInfo = async (query: {
  id: string; // user_id
}) => {
  const response = await callGoogleScript<
    { action: string; token: string | null; body: { id: string } },
    { token: string }
  >('callAction', {
    action: 'GET_MEMBER',
    body: query,
    token: await tokenStorage.getAccessToken(),
  });

  return response;
};

export const getUserInfoQueryOptions = (
  ...args: Parameters<typeof getUserInfo>
): GetUserInfoQueryOptions => {
  return {
    queryKey: ['GET_MEMBER', ...args],
    queryFn: () => getUserInfo(...args),
  };
};

export const useQueryUserInfo = (...args: Parameters<typeof getUserInfoQueryOptions>) => {
  return useQuery(getUserInfoQueryOptions(...args));
};

export const useQueryMyUserInfo = () => {
  const { data, isLoading } = useQueryUsers();
  const { userId } = useAuthGuard();

  const userInfo = useMemo(() => data?.find(({ id }) => id === userId), [data, userId]);
  return {
    isLoading,
    data: userInfo,
  };
};

export const useValidateTokenStorage = () => {
  return useQuery({
    queryKey: ['VALIDATE_TOKEN_STORAGE'],
    queryFn: async () => {
      const userInfo = await tokenStorage.getUserInfo();
      const token = await tokenStorage.getAccessToken();
      return { success: !isNullStr(userInfo?.userId) && !isNullStr(token), ...userInfo, token };
    },
  });
};
