import { useMutation, useQueryClient } from '@tanstack/react-query';
import { streamService } from '../../services/stream.service.js';
import Button from '../common/Button.jsx';
import toast from 'react-hot-toast';

const GoLiveButton = ({ stream }) => {
  const queryClient = useQueryClient();
  const isLive = stream?.status === 'live';

  const mutation = useMutation({
    mutationFn: () => (isLive ? streamService.end(stream._id) : streamService.goLive(stream._id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myStreams'] });
      toast.success(isLive ? 'Stream ended' : "You're live!");
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Something went wrong'),
  });

  return (
    <Button variant={isLive ? 'danger' : 'primary'} onClick={() => mutation.mutate()} isLoading={mutation.isPending}>
      {isLive ? 'End Stream' : 'Go Live'}
    </Button>
  );
};

export default GoLiveButton;
