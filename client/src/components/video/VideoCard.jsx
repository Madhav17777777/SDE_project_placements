import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ROUTES } from '../../constants/routes.js';
import { formatNumber } from '../../utils/formatNumber.js';
import { formatDuration, timeAgo } from '../../utils/formatDuration.js';
import Avatar from '../common/Avatar.jsx';

const VideoCard = ({ video }) => (
  <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
    <Link to={ROUTES.VIDEO(video._id)} className="group block">
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-surface-800">
        {video.thumbnail ? (
          <img src={video.thumbnail} alt={video.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-white/20">No thumbnail</div>
        )}
        <div className="absolute bottom-2 right-2 rounded-md bg-black/70 px-1.5 py-0.5 text-xs font-medium">
          {formatDuration(video.duration)}
        </div>
      </div>
      <div className="mt-3 flex gap-3">
        <Avatar src={video.channel?.owner?.avatar} name={video.channel?.channelName} size="sm" />
        <div className="min-w-0">
          <p className="line-clamp-2 font-medium leading-snug group-hover:text-accent-glow">{video.title}</p>
          <p className="truncate text-sm text-white/50">{video.channel?.channelName}</p>
          <p className="truncate text-xs text-white/40">
            {formatNumber(video.views)} views &middot; {timeAgo(video.createdAt)}
          </p>
        </div>
      </div>
    </Link>
  </motion.div>
);

export default VideoCard;
