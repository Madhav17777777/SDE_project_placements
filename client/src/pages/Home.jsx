import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { streamService } from '../services/stream.service.js';
import { videoService } from '../services/video.service.js';
import { channelService } from '../services/channel.service.js';
import { FALLBACK_CATEGORIES } from '../constants/categories.js';
import FeaturedStream from '../components/home/FeaturedStream.jsx';
import StreamCard from '../components/home/StreamCard.jsx';
import CategoryCard from '../components/home/CategoryCard.jsx';
import VideoCard from '../components/video/VideoCard.jsx';
import { StreamCardSkeleton } from '../components/common/Skeleton.jsx';

const Section = ({ title, children }) => (
  <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-10">
    <h2 className="mb-4 text-xl font-semibold">{title}</h2>
    {children}
  </motion.section>
);

const Home = () => {
  const { data: featuredData } = useQuery({ queryKey: ['streams', 'featured'], queryFn: streamService.getFeatured });
  const { data: liveData, isLoading: liveLoading } = useQuery({
    queryKey: ['streams', 'live', 'home'],
    queryFn: () => streamService.getLive({ limit: 8 }),
  });
  const { data: categoriesData } = useQuery({ queryKey: ['categories'], queryFn: channelService.getCategories });
  const { data: trendingData } = useQuery({
    queryKey: ['videos', 'trending', 'home'],
    queryFn: () => videoService.getTrending({ limit: 8 }),
  });

  const featured = featuredData?.data?.streams?.[0];
  const liveStreams = liveData?.data?.streams || [];
  const categories = categoriesData?.data?.categories?.length ? categoriesData.data.categories : FALLBACK_CATEGORIES;
  const trendingVideos = trendingData?.data?.videos || [];

  return (
    <div>
      {featured && (
        <div className="mb-10">
          <FeaturedStream stream={featured} />
        </div>
      )}

      <Section title="Live Now">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {liveLoading
            ? Array.from({ length: 4 }).map((_, i) => <StreamCardSkeleton key={i} />)
            : liveStreams.map((stream) => <StreamCard key={stream._id} stream={stream} />)}
          {!liveLoading && liveStreams.length === 0 && <p className="text-white/40">No one is live right now.</p>}
        </div>
      </Section>

      <Section title="Popular Categories">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {categories.map((category) => (
            <CategoryCard key={category.slug} category={category} />
          ))}
        </div>
      </Section>

      <Section title="Trending Videos">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {trendingVideos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
          {trendingVideos.length === 0 && <p className="text-white/40">No videos yet.</p>}
        </div>
      </Section>
    </div>
  );
};

export default Home;
