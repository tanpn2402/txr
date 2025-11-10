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

type GetMyUserInfoQueryOptions = UseQueryOptions<
  Awaited<ReturnType<typeof getMyUserInfo>>,
  Error,
  Parameters<typeof getMyUserInfo>
>;

export const getMyUserInfo = async () => {
  const myUserId = await tokenStorage.getUserId();
  if (!myUserId) {
    throw Error('Login required');
  }
  const response = await callGoogleScript<
    { action: string; token: string | null; body: { id: string } },
    { token: string }
  >('callAction', {
    action: 'GET_MEMBER',
    body: {
      id: myUserId,
    },
    token: await tokenStorage.getAccessToken(),
  });

  return response;
};

export const getMyUserInfoQueryOptions = (
  ...args: Parameters<typeof getMyUserInfo>
): GetMyUserInfoQueryOptions => {
  return {
    queryKey: [],
    queryFn: () => getMyUserInfo(...args),
  };
};

export const useQueryMyUserInfo = (...args: Parameters<typeof getMyUserInfoQueryOptions>) => {
  return useQuery(getMyUserInfoQueryOptions(...args));
};

export const useValidateTokenStorage = () => {
  return useQuery({
    queryKey: ['VALIDATE_TOKEN_STORAGE'],
    queryFn: async () => {
      const userId = await tokenStorage.getUserId();
      const token = await tokenStorage.getAccessToken();
      return { success: !userId || !token, userId, token };
    },
  });
};
