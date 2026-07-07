import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth.js';
import { userService } from '../../services/user.service.js';
import { useAuthStore } from '../../store/authStore.js';
import Avatar from '../../components/common/Avatar.jsx';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';

const ProfileSettings = () => {
  const { user } = useAuth();
  const setUser = useAuthStore((s) => s.setUser);
  const avatarInputRef = useRef(null);

  const { register, handleSubmit } = useForm({
    defaultValues: { fullName: user?.fullName, bio: user?.bio },
  });

  const updateProfile = useMutation({
    mutationFn: (payload) => userService.updateProfile(payload),
    onSuccess: ({ data }) => {
      setUser(data.user);
      toast.success('Profile updated');
    },
  });

  const updateAvatar = useMutation({
    mutationFn: (file) => userService.updateAvatar(file),
    onSuccess: ({ data }) => {
      setUser(data.user);
      toast.success('Avatar updated');
    },
  });

  const changePassword = useMutation({
    mutationFn: (payload) => userService.changePassword(payload),
    onSuccess: () => toast.success('Password changed'),
    onError: (err) => toast.error(err.response?.data?.message || 'Could not change password'),
  });

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-xl font-semibold">Profile Settings</h1>

      <div className="glass-card flex items-center gap-4 p-5">
        <Avatar src={user?.avatar} name={user?.username} size="lg" />
        <div>
          <Button variant="secondary" onClick={() => avatarInputRef.current?.click()} isLoading={updateAvatar.isPending}>
            Change avatar
          </Button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && updateAvatar.mutate(e.target.files[0])}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit((v) => updateProfile.mutate(v))} className="glass-card space-y-4 p-5">
        <h2 className="font-medium">Basic info</h2>
        <Input label="Full name" {...register('fullName')} />
        <Input label="Bio" {...register('bio')} />
        <Button type="submit" isLoading={updateProfile.isPending}>
          Save changes
        </Button>
      </form>

      <PasswordForm onSubmit={(v) => changePassword.mutate(v)} isLoading={changePassword.isPending} />
    </div>
  );
};

const PasswordForm = ({ onSubmit, isLoading }) => {
  const { register, handleSubmit, reset } = useForm();

  const submit = (values) => {
    onSubmit(values);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="glass-card space-y-4 p-5">
      <h2 className="font-medium">Change password</h2>
      <Input label="Current password" type="password" {...register('currentPassword')} />
      <Input label="New password" type="password" {...register('newPassword')} />
      <Button type="submit" isLoading={isLoading}>
        Update password
      </Button>
    </form>
  );
};

export default ProfileSettings;
