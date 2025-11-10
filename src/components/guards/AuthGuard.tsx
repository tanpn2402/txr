import { Loader, Modal } from '@mantine/core';
import React, { createContext, useContext } from 'react';

import { useValidateTokenStorage } from '@/services/users/query-user-info';
import { tokenStorage } from '@/utils/storage-utils';

import { LoginFormModal } from '../login-form/LoginFormModal';

interface AuthGuardContextType {
  userId?: string | null;
  token?: string | null;
  setAuthGuard: (
    data: Partial<Omit<AuthGuardContextType, 'setAuthGuard' | 'clearAuthGuard'>>
  ) => void;
  clearAuthGuard: () => void;
}

const AuthGuardContext = createContext<AuthGuardContextType | undefined>(undefined);

export const AuthGuardProvider: React.FC<
  React.PropsWithChildren & {
    //
  }
> = ({ children }) => {
  const { data, isLoading, refetch } = useValidateTokenStorage();

  return (
    <AuthGuardContext.Provider
      value={{
        userId: data?.userId,
        token: data?.token,
        setAuthGuard: async (val) => {
          if (val.token) await tokenStorage.setAccessToken(val.token);
          if (val.userId) await tokenStorage.setUserId(val.userId);
          refetch();
        },
        clearAuthGuard: async () => {
          await tokenStorage.clearTokens();
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
        >
          <Loader color="blue" />
        </Modal>
      ) : (
        <>
          {children}
          <LoginFormModal opened={!!data?.success} />
        </>
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

export { useAuthGuard };
