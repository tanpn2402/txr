import { zodResolver } from '@hookform/resolvers/zod';
import { Avatar, Button, Code, Input, PinInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Controller, type FieldErrors, FormProvider, useForm } from 'react-hook-form';

import { useDebounceFn } from '@/hooks/useDebounceFn';
import { type ILoginForm, LoginFormSchema } from '@/services/users/schema';
import { useLogin } from '@/services/users/user-login';

import { useAuthGuard } from '../guards/AuthGuard';

const LoginForm = () => {
  const { userId, setAuthGuard, clearAuthGuard } = useAuthGuard();

  const methods = useForm({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: { id: userId ?? '' },
  });

  const { control, handleSubmit, formState } = methods;

  const mutation = useLogin({
    onSuccess: async (data) => {
      if (data.data) {
        const userId = methods.getValues('id');
        setAuthGuard({
          userId: userId,
          ...data.data,
        });
      }
    },
    onError: () => {
      notifications.show({
        color: 'red',
        message: 'Failed to submit, please try again after 5 seconds.',
      });
      methods.setError('pin', { message: 'Invalid PIN' });
    },
    retry: 0,
  });

  const onSubmit = (data: ILoginForm) => {
    mutation.mutate(data);
  };

  const onError = (errors: FieldErrors<ILoginForm>) => {
    if (errors.pin) {
      //
    }
  };

  useDebounceFn(
    formState,
    (formState) => {
      if (formState.isDirty && formState.isValid && !formState.errors.id && !formState.errors.pin) {
        handleSubmit(onSubmit)();
      }
    },
    500
  );

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit, onError)} className="max-w-[236px]">
        <div className="flex flex-col gap-y-4">
          {userId ? (
            <div className="mb-4 flex flex-col items-center justify-center gap-2">
              <Avatar radius="xl" className="size-24! rounded-full!" />
              <h2 className="text-2xl">
                Hi <Code className="text-2xl!">{userId}</Code>
              </h2>
              <Button
                variant="outline"
                color="gray"
                type="button"
                size="compact-xs"
                className="mx-8 w-1/2!"
                onClick={() => clearAuthGuard({ token: true, userId: true })}
              >
                other user?
              </Button>
            </div>
          ) : (
            <div className="mb-4 flex flex-col items-center justify-center gap-4">
              <Avatar radius="xl" className="size-24! rounded-full!" />
              <Controller
                control={control}
                name="id"
                render={({ field }) => {
                  return (
                    <Input
                      {...field}
                      placeholder="user.id"
                      size="lg"
                      error={formState.errors.id?.message}
                      tabIndex={userId ? 0 : 1}
                      autoFocus={!userId}
                    />
                  );
                }}
              />
            </div>
          )}
          <Controller
            control={control}
            name="pin"
            render={({ field }) => {
              return (
                <PinInput
                  {...field}
                  mask
                  size="lg"
                  error={!!formState.errors.pin?.message}
                  autoFocus={!!userId}
                  getInputProps={(index) => ({
                    tabIndex: index + 1 + (userId ? 1 : 0),
                  })}
                  disabled={mutation.isPending}
                />
              );
            }}
          />
        </div>

        {userId ? null : (
          <div className="mt-10 flex items-center justify-end gap-4">
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="h-10! w-full min-w-24"
              size="lg"
              w={236}
            >
              {mutation.isPending ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        )}
      </form>
    </FormProvider>
  );
};

export { LoginForm };
