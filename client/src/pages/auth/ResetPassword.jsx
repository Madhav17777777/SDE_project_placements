import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../../services/auth.service.js';
import { ROUTES } from '../../constants/routes.js';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';

const schema = z.object({
  password: z.string().min(8, 'At least 8 characters').regex(/\d/, 'Must contain a number'),
});

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async ({ password }) => {
    try {
      await authService.resetPassword(token, password);
      toast.success('Password reset. Please log in.');
      navigate(ROUTES.LOGIN);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset link is invalid or has expired');
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-center text-xl font-semibold">Set a new password</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="New password" type="password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />
        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Reset password
        </Button>
      </form>
    </div>
  );
};

export default ResetPassword;
