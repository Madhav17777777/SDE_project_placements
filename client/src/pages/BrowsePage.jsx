import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { streamService } from '../services/stream.service.js';
import { videoService } from '../services/video.service.js';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll.js';
import StreamCard from '../components/home/StreamCard.jsx';
import VideoCard from '../components/video/VideoCard.jsx';
import { StreamCardSkeleton } from '../components/common/Skeleton.jsx';
import { cn } from '../utils/cn.js';

const TABS = [
  { key: 'live', label: 'Live Streams' },
  { key: 'videos', label: 'Videos' },
];

const BrowsePage = () => {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category') || undefined;
  const [tab, setTab] = useState('live');

  const streamsQuery = useInfiniteQuery({
    queryKey: ['streams', 'live', 'browse', category],
    queryFn: ({ pageParam = 1 }) => streamService.getLive({ page: pageParam, category }),
    getNextPageParam: (last) => (last.data.meta.hasNextPage ? last.data.meta.page + 1 : undefined),
    enabled: tab === 'live',
  });

  const videosQuery = useInfiniteQuery({
    queryKey: ['videos', 'browse', category],
    queryFn: ({ pageParam = 1 }) => videoService.list({ page: pageParam, category, sort: 'newest' }),
    getNextPageParam: (last) => (last.data.meta.hasNextPage ? last.data.meta.page + 1 : undefined),
    enabled: tab === 'videos',
  });

  const activeQuery = tab === 'live' ? streamsQuery : videosQuery;
  const sentinelRef = useInfiniteScroll(() => activeQuery.fetchNextPage(), {
    enabled: Boolean(activeQuery.hasNextPage) && !activeQuery.isFetchingNextPage,
  });

  const items = activeQuery.data?.pages.flatMap((p) => p.data.streams || p.data.videos) || [];

  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
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
        {category && <span className="ml-2 text-sm text-white/40">in {category.replace(/-/g, ' ')}</span>}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {activeQuery.isLoading
          ? Array.from({ length: 8 }).map((_, i) => <StreamCardSkeleton key={i} />)
          : items.map((item) => (tab === 'live' ? <StreamCard key={item._id} stream={item} /> : <VideoCard key={item._id} video={item} />))}
      </div>

      {items.length === 0 && !activeQuery.isLoading && <p className="mt-8 text-white/40">Nothing here yet.</p>}
      <div ref={sentinelRef} className="h-10" />
    </div>
  );
};

export default BrowsePage;
