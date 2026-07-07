import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { authService } from '../../services/auth.service.js';
import { ROUTES } from '../../constants/routes.js';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';

const schema = z.object({ email: z.string().email('Enter a valid email') });

const ForgotPassword = () => {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email }) => {
    await authService.forgotPassword(email);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="text-center">
        <h1 className="mb-2 text-xl font-semibold">Check your email</h1>
        <p className="text-sm text-white/60">If that email exists, a reset link is on its way.</p>
        <Link to={ROUTES.LOGIN} className="mt-6 inline-block text-sm text-accent-glow hover:underline">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-center text-xl font-semibold">Reset your password</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Send reset link
        </Button>
      </form>
    </div>
  );
};

export default ForgotPassword;
