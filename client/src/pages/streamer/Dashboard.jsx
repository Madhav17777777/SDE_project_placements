import { useQuery } from '@tanstack/react-query';
import { channelService } from '../../services/channel.service.js';
import { useAuth } from '../../hooks/useAuth.js';
import { formatNumber } from '../../utils/formatNumber.js';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes.js';
import Button from '../../components/common/Button.jsx';

const StatCard = ({ label, value }) => (
  <div className="glass-card p-5">
    <p className="text-sm text-white/50">{label}</p>
    <p className="mt-1 text-2xl font-bold">{value}</p>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();

  const { data } = useQuery({
    queryKey: ['myChannel', user?.channel],
    queryFn: () => channelService.getBySlug(user.channelSlug || user.channel),
    enabled: Boolean(user?.channel),
  });

  const channel = data?.data?.channel;

  if (!user?.channel) {
    return (
      <div className="glass-card p-8 text-center">
        <h2 className="text-lg font-semibold">You don&apos;t have a channel yet</h2>
        <p className="mt-2 text-sm text-white/50">Create one to start streaming and uploading videos.</p>
        <Link to={ROUTES.CHANNEL_SETTINGS}>
          <Button className="mt-5">Create your channel</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Creator Overview</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Followers" value={formatNumber(channel?.followersCount)} />
        <StatCard label="Total Views" value={formatNumber(channel?.totalViews)} />
        <StatCard label="Status" value={channel?.isLive ? 'Live' : 'Offline'} />
        <StatCard label="Category" value={channel?.category?.name || '—'} />
      </div>
    </div>
  );
};

export default Dashboard;
