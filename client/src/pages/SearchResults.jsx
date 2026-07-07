import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { videoService } from '../services/video.service.js';
import StreamCard from '../components/home/StreamCard.jsx';
import VideoCard from '../components/video/VideoCard.jsx';
import Avatar from '../components/common/Avatar.jsx';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes.js';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';

  const { data, isLoading } = useQuery({
    queryKey: ['search', q],
    queryFn: () => videoService.search({ q, type: 'all' }),
    enabled: Boolean(q),
  });

  const results = data?.data || { users: [], videos: [], streams: [], categories: [] };

  if (!q) return <p className="text-white/40">Type something to search for.</p>;
  if (isLoading) return <p className="text-white/40">Searching...</p>;

  const hasAny = results.users.length || results.videos.length || results.streams.length || results.categories.length;

  return (
    <div className="space-y-10">
      <h1 className="text-xl font-semibold">Results for &ldquo;{q}&rdquo;</h1>
      {!hasAny && <p className="text-white/40">No results found.</p>}

      {results.streams.length > 0 && (
        <section>
          <h2 className="mb-3 font-medium text-white/70">Live Streams</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {results.streams.map((s) => (
              <StreamCard key={s._id} stream={s} />
            ))}
          </div>
        </section>
      )}

      {results.videos.length > 0 && (
        <section>
          <h2 className="mb-3 font-medium text-white/70">Videos</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {results.videos.map((v) => (
              <VideoCard key={v._id} video={v} />
            ))}
          </div>
        </section>
      )}

      {results.users.length > 0 && (
        <section>
          <h2 className="mb-3 font-medium text-white/70">Users</h2>
          <div className="flex flex-wrap gap-4">
            {results.users.map((u) => (
              <Link key={u._id} to={`/u/${u.username}`} className="glass-card flex items-center gap-3 px-4 py-3">
                <Avatar src={u.avatar} name={u.username} />
                <span>{u.username}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {results.categories.length > 0 && (
        <section>
          <h2 className="mb-3 font-medium text-white/70">Categories</h2>
          <div className="flex flex-wrap gap-3">
            {results.categories.map((c) => (
              <Link key={c._id} to={`${ROUTES.BROWSE}?category=${c.slug}`} className="glass-card px-4 py-2 text-sm hover:text-accent-glow">
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default SearchResults;
