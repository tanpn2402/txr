import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, PinInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Controller, type FieldErrors, FormProvider, useForm } from 'react-hook-form';

import { type ILoginForm,LoginFormSchema } from '@/services/users/schema';
import { useLogin } from '@/services/users/user-login';

import { useAuthGuard } from '../guards/AuthGuard';

const LoginForm = () => {
  const { userId, setAuthGuard } = useAuthGuard();

  const methods = useForm({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: { id: userId ?? '' },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = methods;

  const mutation = useLogin({
    onSuccess: async (data) => {
      if (data.data) {
        const token = data.data.token;
        const userId = methods.getValues('id');
        setAuthGuard({
          userId: userId,
          token,
        });
      }
    },
    onError: () => {
      notifications.show({
        color: 'red',
        message: 'Failed to submit, please try again after 5 seconds.',
      });
    },
  });

  const onSubmit = (data: ILoginForm) => {
    mutation.mutate(data);
  };

  const onError = (errors: FieldErrors<ILoginForm>) => {
    if (errors.pin) {
      //
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit, onError)} className="max-w-[236px]">
        <div className="flex flex-col gap-y-4">
          <Controller
            control={control}
            name="id"
            render={({ field }) => {
              return (
                <Input {...field} placeholder="user.id" size="lg" error={errors.id?.message} />
              );
            }}
          />
          <Controller
            control={control}
            name="pin"
            render={({ field }) => {
              return <PinInput {...field} mask size="lg" error={!!errors.pin?.message} />;
            }}
          />
        </div>

        <div className="mt-10 flex items-center justify-end gap-4">
          <Button
            type="submit"
            disabled={mutation.isPending}
            className="w-full min-w-24"
            size="lg"
            w={236}
          >
            {mutation.isPending ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export { LoginForm };
