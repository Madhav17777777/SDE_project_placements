import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth.js';
import { authService } from '../../services/auth.service.js';
import { ROUTES } from '../../constants/routes.js';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import { FaGoogle } from 'react-icons/fa';

const schema = z.object({
  identifier: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
});

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    try {
      await login(values);
      navigate(location.state?.from?.pathname || ROUTES.HOME, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-center text-xl font-semibold">Log in to StreamVerse</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Email or username" placeholder="you@example.com" error={errors.identifier?.message} {...register('identifier')} />
        <Input label="Password" type="password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />

        <div className="text-right">
          <Link to={ROUTES.FORGOT_PASSWORD} className="text-sm text-accent-glow hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Log in
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-white/30">
        <div className="h-px flex-1 bg-white/10" /> OR <div className="h-px flex-1 bg-white/10" />
      </div>

      <a href={authService.googleLoginUrl()} className="btn-secondary w-full">
        <FaGoogle /> Continue with Google
      </a>

      <p className="mt-6 text-center text-sm text-white/50">
        Don&apos;t have an account?{' '}
        <Link to={ROUTES.SIGNUP} className="font-medium text-accent-glow hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default Login;
