import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { callGoogleScript } from '@/utils/gs';
import { tokenStorage } from '@/utils/storage-utils';

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
    queryKey: [],
    queryFn: () => getUserInfo(...args),
  };
};

export const useQueryUserInfo = (...args: Parameters<typeof getUserInfoQueryOptions>) => {
  return useQuery(getUserInfoQueryOptions(...args));
};
