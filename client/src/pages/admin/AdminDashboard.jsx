import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service.js';
import { formatNumber } from '../../utils/formatNumber.js';

const StatCard = ({ label, value }) => (
  <div className="glass-card p-5">
    <p className="text-sm text-white/50">{label}</p>
    <p className="mt-1 text-2xl font-bold">{value}</p>
  </div>
);

const AdminDashboard = () => {
  const { data } = useQuery({ queryKey: ['admin', 'dashboard'], queryFn: adminService.getDashboard });
  const stats = data?.data || {};

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Admin Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <StatCard label="Total Users" value={formatNumber(stats.totalUsers)} />
        <StatCard label="Streamers" value={formatNumber(stats.totalStreamers)} />
        <StatCard label="Live Now" value={formatNumber(stats.liveStreamsCount)} />
        <StatCard label="Total Videos" value={formatNumber(stats.totalVideos)} />
        <StatCard label="Total Channels" value={formatNumber(stats.totalChannels)} />
      </div>
    </div>
  );
};

export default AdminDashboard;
