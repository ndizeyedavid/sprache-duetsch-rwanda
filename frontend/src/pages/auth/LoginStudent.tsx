import { LoginForm } from './LoginForm';

export function LoginStudent() {
  return (
    <LoginForm
      portal="student"
      title="Welcome back"
      subtitle="Sign in to reach your lessons, notes, attendance and payment history."
    />
  );
}
