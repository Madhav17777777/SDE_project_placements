import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../../services/user.service.js';
import VideoCard from '../../components/video/VideoCard.jsx';
import Button from '../../components/common/Button.jsx';

const WatchHistory = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['watchHistory'],
    queryFn: () => userService.getWatchHistory({ limit: 30 }),
  });

  const remove = useMutation({
    mutationFn: (videoId) => userService.removeFromWatchHistory(videoId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['watchHistory'] }),
  });

  const videos = data?.data?.videos || [];

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Watch History</h1>
      {isLoading && <p className="text-white/40">Loading...</p>}
      {!isLoading && videos.length === 0 && <p className="text-white/40">Nothing watched yet.</p>}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {videos.map((video) => (
          <div key={video._id} className="space-y-2">
            <VideoCard video={video} />
            <Button variant="ghost" className="w-full text-xs" onClick={() => remove.mutate(video._id)}>
              Remove from history
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WatchHistory;
