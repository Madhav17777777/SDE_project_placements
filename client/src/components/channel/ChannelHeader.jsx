import { formatNumber } from '../../utils/formatNumber.js';
import Avatar from '../common/Avatar.jsx';
import FollowButton from './FollowButton.jsx';

const ChannelHeader = ({ channel }) => {
  if (!channel) return null;

  return (
    <div className="glass-card overflow-hidden">
      <div className="h-32 w-full bg-gradient-to-r from-accent-700/40 to-surface-700 md:h-48">
        {channel.owner?.banner && <img src={channel.owner.banner} alt="" className="h-full w-full object-cover" />}
      </div>
      <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-end gap-4">
          <Avatar src={channel.owner?.avatar} name={channel.channelName} size="xl" isLive={channel.isLive} className="-mt-14 ring-4 ring-surface-900" />
          <div>
            <h1 className="text-2xl font-bold">{channel.channelName}</h1>
            <p className="text-sm text-white/50">{formatNumber(channel.followersCount)} followers</p>
          </div>
        </div>
        <FollowButton channelId={channel._id} />
      </div>
      {channel.description && <p className="px-6 pb-6 text-sm text-white/70">{channel.description}</p>}
    </div>
  );
};

export default ChannelHeader;
