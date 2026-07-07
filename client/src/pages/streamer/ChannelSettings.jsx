import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { channelService } from '../../services/channel.service.js';
import { useAuth } from '../../hooks/useAuth.js';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';

const ChannelSettings = () => {
  const { user } = useAuth();
  const { register, handleSubmit } = useForm();

  const createChannel = useMutation({
    mutationFn: (payload) => channelService.create(payload),
    onSuccess: () => {
      toast.success('Channel created! Refresh to see your dashboard.');
      window.location.reload();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Could not create channel'),
  });

  const updateChannel = useMutation({
    mutationFn: (payload) => channelService.update(payload),
    onSuccess: () => toast.success('Channel updated'),
  });

  if (!user?.channel) {
    return (
      <div className="mx-auto max-w-xl">
        <h1 className="mb-6 text-xl font-semibold">Create Your Channel</h1>
        <form onSubmit={handleSubmit((v) => createChannel.mutate(v))} className="glass-card space-y-4 p-5">
          <Input label="Channel name" placeholder="YourNameLive" {...register('channelName', { required: true })} />
          <Input label="Description" placeholder="Tell viewers what you stream" {...register('description')} />
          <Button type="submit" isLoading={createChannel.isPending} className="w-full">
            Create channel
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-xl font-semibold">Channel Settings</h1>
      <form onSubmit={handleSubmit((v) => updateChannel.mutate(v))} className="glass-card space-y-4 p-5">
        <Input label="Description" placeholder="Tell viewers what you stream" {...register('description')} />
        <Input label="Twitter" placeholder="https://twitter.com/you" {...register('socials.twitter')} />
        <Input label="Discord" placeholder="https://discord.gg/you" {...register('socials.discord')} />
        <Button type="submit" isLoading={updateChannel.isPending}>
          Save changes
        </Button>
      </form>
    </div>
  );
};

export default ChannelSettings;
