import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { streamService } from '../services/stream.service.js';
import { useStreamStore } from '../store/streamStore.js';
import { useAuth } from '../hooks/useAuth.js';
import StreamPlayer from '../components/stream/StreamPlayer.jsx';
import ChatBox from '../components/chat/ChatBox.jsx';
import FollowButton from '../components/channel/FollowButton.jsx';
import Avatar from '../components/common/Avatar.jsx';
import Badge from '../components/common/Badge.jsx';
import Spinner from '../components/common/Spinner.jsx';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes.js';

const StreamPage = () => {
  const { streamId } = useParams();
  const liveViewerCount = useStreamStore((s) => s.viewerCount);
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['stream', streamId],
    queryFn: () => streamService.getById(streamId),
    enabled: Boolean(streamId),
  });

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Spinner size={32} />
      </div>
    );
  }

  const stream = data?.data?.stream;
  if (!stream) return <p className="text-white/40">Stream not found.</p>;

  const channel = stream.channel;
  const ownerId = channel?.owner?._id ?? channel?.owner;
  const isOwner = Boolean(user && ownerId && String(ownerId) === String(user._id));

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="min-w-0 flex-1">
        <StreamPlayer stream={stream} viewerCount={liveViewerCount || stream.viewerCount} isOwner={isOwner} />

        <div className="glass-card mt-4 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-xl font-semibold">{stream.title}</h1>
              <Link to={ROUTES.CHANNEL(channel?.slug)} className="mt-2 flex items-center gap-3 hover:text-accent-glow">
                <Avatar src={channel?.owner?.avatar} name={channel?.channelName} />
                <div>
                  <p className="font-medium">{channel?.channelName}</p>
                  <p className="text-xs text-white/40">{channel?.followersCount ?? 0} followers</p>
                </div>
              </Link>
              {stream.tags?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {stream.tags.map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </div>
              )}
            </div>
            <FollowButton channelId={channel?._id} />
          </div>
        </div>
      </div>

      <ChatBox streamId={stream._id} />
    </div>
  );
};

export default StreamPage;
