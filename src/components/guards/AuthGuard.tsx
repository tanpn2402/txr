import { Loader, Modal } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import React, { createContext, useContext } from 'react';

import { useValidateTokenStorage } from '@/services/users/query-user-info';
import type { MutationOptions } from '@/types/MutationOptions';
import { tokenStorage } from '@/utils/storage-utils';

const TOKEN_ISSUES = [
  'Token expired',
  'Invalid or expired token',
  'Missing token',
  'Invalid token',
];

interface AuthGuardContextType {
  userId?: string | null;
  token?: string | null;
  role?: string | null;
  name?: string | null;
  setAuthGuard: (
    data: Partial<Omit<AuthGuardContextType, 'setAuthGuard' | 'clearAuthGuard'>>
  ) => void;
  clearAuthGuard: (options?: { token?: boolean; userId?: boolean }) => void;
}

const AuthGuardContext = createContext<AuthGuardContextType | undefined>(undefined);

export const AuthGuardProvider: React.FC<
  React.PropsWithChildren & {
    //
  }
> = ({ children }) => {
  const { data, isLoading, refetch } = useValidateTokenStorage();

  console.log('[AuthGuard] Data', data);

  return (
    <AuthGuardContext.Provider
      value={{
        ...data,
        setAuthGuard: async (val) => {
          const { token, ...userInfo } = val;
          if (token) await tokenStorage.setAccessToken(token);
          if (userInfo.userId) await tokenStorage.setUserInfo(userInfo);
          refetch();
        },
        clearAuthGuard: async (options = { token: true }) => {
          if (options.token) await tokenStorage.clearTokens();
          if (options.userId) await tokenStorage.clearUserInfo();
          refetch();
        },
      }}
    >
      {isLoading ? (
        <Modal
          opened={isLoading}
          onClose={() => {}}
          centered
          size="auto"
          overlayProps={{
            backgroundOpacity: 0.55,
            blur: 1,
          }}
          closeButtonProps={{
            hidden: true,
          }}
          className="[&_.mantine-Modal-body]:size-16! [&_.mantine-Modal-body]:pt-4! [&_.mantine-Modal-header]:hidden!"
        >
          <Loader color="blue" size={32} />
        </Modal>
      ) : (
        children
      )}
    </AuthGuardContext.Provider>
  );
};

function useAuthGuard() {
  const context = useContext(AuthGuardContext);
  if (!context) {
    throw new Error('useAuthGuard must be used within a AuthGuardProvider');
  }
  return context;
}

const authGuardMutationMiddleware = (authGuard: AuthGuardContextType) => {
  return function <T, V>(mutationOptions: MutationOptions<T, V>): MutationOptions<T, V> {
    const { onError, ...options } = mutationOptions;

    return {
      ...options,
      onError: (error, variables, onMutateResult, context) => {
        if (
          (error instanceof Error && TOKEN_ISSUES.includes(error.message)) ||
          (typeof error === 'string' && TOKEN_ISSUES.includes(error))
        ) {
          authGuard.clearAuthGuard({ token: true });
          notifications.show({
            color: 'red',
            message: 'Your session is expired. Please enter your PIN and submit again.',
          });
        } else if (onError) {
          onError(error, variables, onMutateResult, context);
        }
      },
    };
  };
};

export { authGuardMutationMiddleware,useAuthGuard };
