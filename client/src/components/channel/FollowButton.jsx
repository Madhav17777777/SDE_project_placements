import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '../../services/user.service.js';
import { useAuth } from '../../hooks/useAuth.js';
import Button from '../common/Button.jsx';
import toast from 'react-hot-toast';

const FollowButton = ({ channelId }) => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['followStatus', channelId],
    queryFn: () => userService.getFollowStatus(channelId),
    enabled: isAuthenticated && Boolean(channelId),
  });

  const isFollowing = data?.data?.following;

  const toggle = useMutation({
    mutationFn: () => (isFollowing ? userService.unfollowChannel(channelId) : userService.followChannel(channelId)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['followStatus', channelId] }),
    onError: () => toast.error('Something went wrong'),
  });

  if (!isAuthenticated) {
    return (
      <Button variant="primary" onClick={() => toast('Log in to follow channels')}>
        Follow
      </Button>
    );
  }

  return (
    <Button variant={isFollowing ? 'secondary' : 'primary'} onClick={() => toggle.mutate()} isLoading={toggle.isPending}>
      {isFollowing ? 'Following' : 'Follow'}
    </Button>
  );
};

export default FollowButton;
