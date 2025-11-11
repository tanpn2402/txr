import { Loader, Modal } from '@mantine/core';
import React, { createContext, useContext } from 'react';

import { useValidateTokenStorage } from '@/services/users/query-user-info';
import { tokenStorage } from '@/utils/storage-utils';

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

export { useAuthGuard };
