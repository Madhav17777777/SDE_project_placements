import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth.js';
import { ROUTES } from '../../constants/routes.js';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';

const schema = z.object({
  username: z
    .string()
    .min(3, 'At least 3 characters')
    .max(20, 'At most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Letters, numbers, and underscores only'),
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters').regex(/\d/, 'Must contain a number'),
});

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    try {
      await signup(values);
      toast.success('Account created! Check your email to verify your address.');
      navigate(ROUTES.LOGIN);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-center text-xl font-semibold">Create your account</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Username" placeholder="coolstreamer" error={errors.username?.message} {...register('username')} />
        <Input label="Full name" placeholder="Jane Doe" error={errors.fullName?.message} {...register('fullName')} />
        <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
        <Input label="Password" type="password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />

        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Sign up
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-white/50">
        Already have an account?{' '}
        <Link to={ROUTES.LOGIN} className="font-medium text-accent-glow hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
};

export default Signup;
