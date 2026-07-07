import { useParams, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IoThumbsUpOutline, IoThumbsDownOutline, IoShareSocialOutline, IoBookmarkOutline } from 'react-icons/io5';
import { videoService } from '../services/video.service.js';
import { userService } from '../services/user.service.js';
import { formatNumber } from '../utils/formatNumber.js';
import { timeAgo } from '../utils/formatDuration.js';
import { ROUTES } from '../constants/routes.js';
import Avatar from '../components/common/Avatar.jsx';
import FollowButton from '../components/channel/FollowButton.jsx';
import CommentSection from '../components/video/CommentSection.jsx';
import Spinner from '../components/common/Spinner.jsx';
import toast from 'react-hot-toast';

const VideoPage = () => {
  const { videoId } = useParams();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['video', videoId],
    queryFn: () => videoService.getById(videoId),
    enabled: Boolean(videoId),
  });

  const react = useMutation({
    mutationFn: (type) => videoService.react(videoId, type),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['video', videoId] }),
  });

  const bookmark = useMutation({
    mutationFn: () => userService.addBookmark(videoId),
    onSuccess: () => toast.success('Saved to bookmarks'),
  });

  const share = useMutation({
    mutationFn: () => videoService.share(videoId),
    onSuccess: ({ data: shareData }) => {
      navigator.clipboard?.writeText(`${window.location.origin}${shareData.link}`);
      toast.success('Link copied to clipboard');
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Spinner size={32} />
      </div>
    );
  }

  const video = data?.data?.video;
  if (!video) return <p className="text-white/40">Video not found.</p>;

  const channel = video.channel;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
        <video src={video.videoUrl} controls className="h-full w-full" poster={video.thumbnail} />
      </div>

      <h1 className="mt-4 text-xl font-semibold">{video.title}</h1>
      <p className="mt-1 text-sm text-white/40">
        {formatNumber(video.views)} views &middot; {timeAgo(video.createdAt)}
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <Link to={ROUTES.CHANNEL(channel?.slug)} className="flex items-center gap-3 hover:text-accent-glow">
          <Avatar src={channel?.owner?.avatar} name={channel?.channelName} />
          <span className="font-medium">{channel?.channelName}</span>
        </Link>

        <div className="flex items-center gap-2">
          <FollowButton channelId={channel?._id} />
          <button onClick={() => react.mutate('like')} className="btn-secondary">
            <IoThumbsUpOutline /> {formatNumber(video.likesCount)}
          </button>
          <button onClick={() => react.mutate('dislike')} className="btn-secondary">
            <IoThumbsDownOutline /> {formatNumber(video.dislikesCount)}
          </button>
          <button onClick={() => share.mutate()} className="btn-secondary">
            <IoShareSocialOutline /> Share
          </button>
          <button onClick={() => bookmark.mutate()} className="btn-secondary">
            <IoBookmarkOutline /> Save
          </button>
        </div>
      </div>

      {video.description && <p className="glass-card mt-4 whitespace-pre-wrap p-4 text-sm text-white/70">{video.description}</p>}

      <div className="mt-8">
        <CommentSection videoId={videoId} />
      </div>
    </div>
  );
};

export default VideoPage;
