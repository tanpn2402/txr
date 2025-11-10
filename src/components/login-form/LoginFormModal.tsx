import { Modal } from '@mantine/core';
import type React from 'react';

import { LoginForm } from './LoginForm';

export const LoginFormModal: React.FC<{
  opened: boolean;
}> = ({ opened }) => {
  return (
    <Modal
      opened={opened}
      onClose={() => {}}
      title="Please login"
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
      <LoginForm />
    </Modal>
  );
};
