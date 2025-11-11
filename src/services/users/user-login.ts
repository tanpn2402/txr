import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { callGoogleScript } from '@/utils/gs';

import type { ILoginForm } from './schema';

type LoginMutationOptions = UseMutationOptions<
  Awaited<ReturnType<typeof userLogin>>,
  Error,
  Parameters<typeof userLogin>[0],
  unknown
>;

export const userLogin = async (data: ILoginForm) => {
  const response = await callGoogleScript<
    { action: string; body: ILoginForm },
    { token: string; name: string; role: string }
  >('callAction', {
    action: 'LOGIN',
    body: data,
  });
  if (!response.success) {
    throw Error(typeof response.error === 'string' ? response.error : response.error?.message);
  }
  return response;
};

export const getLoginMutationOptions = (options: Omit<LoginMutationOptions, 'mutationFn'>) => {
  return {
    mutationFn: userLogin,
    ...options,
  };
};

export const useLogin = (...args: Parameters<typeof getLoginMutationOptions>) => {
  return useMutation(getLoginMutationOptions(...args));
};
