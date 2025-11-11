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
      centered
      title={false}
      size="auto"
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 1,
      }}
      closeButtonProps={{
        hidden: true,
      }}
      className="[&_.mantine-Modal-body]:pt-4! [&_.mantine-Modal-header]:hidden!"
    >
      <LoginForm />
    </Modal>
  );
};
