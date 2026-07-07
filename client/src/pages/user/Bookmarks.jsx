import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { userService } from '../../services/user.service.js';
import VideoCard from '../../components/video/VideoCard.jsx';
import { cn } from '../../utils/cn.js';

const TABS = [
  { key: 'bookmarks', label: 'Bookmarks', fetcher: userService.getBookmarks },
  { key: 'watchLater', label: 'Watch Later', fetcher: userService.getWatchLater },
  { key: 'liked', label: 'Liked Videos', fetcher: userService.getLikedVideos },
];

const Bookmarks = () => {
  const [tab, setTab] = useState('bookmarks');
  const active = TABS.find((t) => t.key === tab);

  const { data, isLoading } = useQuery({
    queryKey: [tab],
    queryFn: () => active.fetcher({ limit: 30 }),
  });

  const videos = data?.data?.videos || [];

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Your Library</h1>
      <div className="mb-6 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'rounded-xl px-4 py-2 text-sm font-medium transition-colors',
              tab === t.key ? 'bg-accent-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-white/40">Loading...</p>}
      {!isLoading && videos.length === 0 && <p className="text-white/40">Nothing here yet.</p>}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {videos.map((video) => (
          <VideoCard key={video._id} video={video} />
        ))}
      </div>
    </div>
  );
};

export default Bookmarks;
