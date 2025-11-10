import { AuthGuardProvider } from './components/guards/AuthGuard';
import { TaskForm } from './components/task-form/TaskForm';

export default function App() {
  return (
    <AuthGuardProvider>
      <div className="mx-auto max-w-7xl p-8">
        <TaskForm />
      </div>
    </AuthGuardProvider>
  );
}
