import { Avatar, Button, Code, Skeleton } from '@mantine/core';

import { useQueryMyUserInfo } from '@/services/users/query-user-info';
import { cn } from '@/utils/cn';

import { useAuthGuard } from '../guards/AuthGuard';

const AppHeader = () => {
  const { userId, name, clearAuthGuard } = useAuthGuard();
  const { data: myUserInfo, isLoading } = useQueryMyUserInfo();

  return (
    <div className="mb-4 flex h-10 items-center gap-2">
      {userId ? (
        isLoading ? (
          <div className="flex flex-nowrap items-center gap-2">
            <Skeleton height={38} width={34} circle />
            <Skeleton height={38} width={250} />
          </div>
        ) : (
          <div className="flex flex-nowrap items-center gap-2">
            {myUserInfo?.avatar ? (
              <Avatar
                radius="md"
                className={cn([
                  'size-10! rounded-full!',
                  myUserInfo?.avatar && 'border-2 border-gray-300',
                ])}
                src={myUserInfo?.avatar}
              />
            ) : (
              <h2 className="text-2xl">Hi </h2>
            )}

            <Code className="text-2xl!">{myUserInfo?.name ?? name ?? '<no-name/>'}</Code>
            <Button
              variant="outline"
              color="gray"
              type="button"
              size="compact-xs"
              className="mx-8"
              onClick={() => clearAuthGuard()}
            >
              Logout
            </Button>
          </div>
        )
      ) : null}
    </div>
  );
};

export { AppHeader };
