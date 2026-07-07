import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { channelService } from '../services/channel.service.js';
import ChannelHeader from '../components/channel/ChannelHeader.jsx';
import StreamCard from '../components/home/StreamCard.jsx';
import VideoCard from '../components/video/VideoCard.jsx';
import Spinner from '../components/common/Spinner.jsx';
import { cn } from '../utils/cn.js';

const TABS = ['Videos', 'Streams'];

const ChannelPage = () => {
  const { slug } = useParams();
  const [tab, setTab] = useState('Videos');

  const { data, isLoading } = useQuery({
    queryKey: ['channel', slug],
    queryFn: () => channelService.getBySlug(slug),
    enabled: Boolean(slug),
  });

  const { data: videosData } = useQuery({
    queryKey: ['channel', slug, 'videos'],
    queryFn: () => channelService.getVideos(slug),
    enabled: Boolean(slug) && tab === 'Videos',
  });

  const { data: streamsData } = useQuery({
    queryKey: ['channel', slug, 'streams'],
    queryFn: () => channelService.getStreams(slug),
    enabled: Boolean(slug) && tab === 'Streams',
  });

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Spinner size={32} />
      </div>
    );
  }

  const channel = data?.data?.channel;
  if (!channel) return <p className="text-white/40">Channel not found.</p>;

  const videos = videosData?.data?.videos || [];
  const streams = streamsData?.data?.streams || [];

  return (
    <div>
      <ChannelHeader channel={channel} />

      <div className="mt-6 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'rounded-xl px-4 py-2 text-sm font-medium transition-colors',
              tab === t ? 'bg-accent-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {tab === 'Videos' && videos.map((v) => <VideoCard key={v._id} video={v} />)}
        {tab === 'Streams' && streams.map((s) => <StreamCard key={s._id} stream={{ ...s, channel }} />)}
      </div>

      {tab === 'Videos' && videos.length === 0 && <p className="mt-6 text-white/40">No videos yet.</p>}
      {tab === 'Streams' && streams.length === 0 && <p className="mt-6 text-white/40">No past streams yet.</p>}
    </div>
  );
};

export default ChannelPage;
