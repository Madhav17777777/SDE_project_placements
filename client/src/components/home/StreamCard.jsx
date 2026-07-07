import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ROUTES } from '../../constants/routes.js';
import { formatNumber } from '../../utils/formatNumber.js';
import Avatar from '../common/Avatar.jsx';
import Badge from '../common/Badge.jsx';

const StreamCard = ({ stream }) => (
  <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
    <Link to={ROUTES.STREAM(stream._id)} className="group block">
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-surface-800">
        {stream.thumbnail ? (
          <img
            src={stream.thumbnail}
            alt={stream.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-white/20">No preview</div>
        )}
        <div className="absolute left-2 top-2 flex items-center gap-2">
          <Badge variant="live">
            <span className="live-dot mr-1" /> Live
          </Badge>
        </div>
        <div className="absolute bottom-2 right-2 rounded-md bg-black/70 px-1.5 py-0.5 text-xs font-medium">
          {formatNumber(stream.viewerCount)} viewers
        </div>
      </div>
      <div className="mt-3 flex gap-3">
        <Avatar src={stream.channel?.owner?.avatar} name={stream.channel?.channelName} size="sm" />
        <div className="min-w-0">
          <p className="truncate font-medium leading-snug group-hover:text-accent-glow">{stream.title}</p>
          <p className="truncate text-sm text-white/50">{stream.channel?.channelName}</p>
        </div>
      </div>
    </Link>
  </motion.div>
);

export default StreamCard;
