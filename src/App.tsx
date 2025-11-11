import { useMemo } from 'react';

import { AppHeader } from './components/app-header/AppHeader';
import { useAuthGuard } from './components/guards/AuthGuard';
import { LoginFormModal } from './components/login-form/LoginFormModal';
import { TaskForm } from './components/task-form/TaskForm';

export default function App() {
  const { token, userId } = useAuthGuard();
  const isValidSession = useMemo(() => !token || !userId, [token, userId]);

  return (
    <div className="mx-auto max-w-7xl p-8">
      <AppHeader />
      <TaskForm />
      <LoginFormModal opened={isValidSession} />
    </div>
  );
}
