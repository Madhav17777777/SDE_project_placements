import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ROUTES } from '../../constants/routes.js';
import { formatNumber } from '../../utils/formatNumber.js';
import Button from '../common/Button.jsx';
import Badge from '../common/Badge.jsx';

const FeaturedStream = ({ stream }) => {
  if (!stream) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="glass-card relative overflow-hidden p-0"
    >
      <div className="relative aspect-[21/9] w-full bg-surface-800">
        {stream.thumbnail && (
          <img src={stream.thumbnail} alt={stream.title} className="h-full w-full object-cover opacity-70" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-surface-950/30 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 md:p-10">
          <Badge variant="live" className="mb-3">
            <span className="live-dot mr-1" /> Live now
          </Badge>
          <h2 className="max-w-xl text-2xl font-bold leading-tight md:text-4xl">{stream.title}</h2>
          <p className="mt-2 text-white/70">
            {stream.channel?.channelName} &middot; {formatNumber(stream.viewerCount)} watching
          </p>
          <Link to={ROUTES.STREAM(stream._id)}>
            <Button variant="primary" className="mt-5">
              Watch now
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default FeaturedStream;
