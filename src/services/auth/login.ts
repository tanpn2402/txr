import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { callGoogleScript } from '@/utils/gs';

import type { IAuth } from './schema';

type LoginMutationOptions = UseMutationOptions<
  Awaited<ReturnType<typeof userLogin>>,
  Error,
  Parameters<typeof userLogin>[0],
  unknown
>;

export const userLogin = async (data: IAuth) => {
  const response = await callGoogleScript<{ action: string; body: IAuth }, { token: string }>(
    'callAction',
    {
      action: 'LOGIN',
      body: data,
    }
  );

  return response;
};

export const getCreateTaskMutationOptions = (options: Omit<LoginMutationOptions, 'mutationFn'>) => {
  return {
    mutationFn: userLogin,
    ...options,
  };
};

export const useLogin = (...args: Parameters<typeof getCreateTaskMutationOptions>) => {
  return useMutation(getCreateTaskMutationOptions(...args));
};
