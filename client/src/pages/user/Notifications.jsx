import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../../services/user.service.js';
import { useNotificationStore } from '../../store/notificationStore.js';
import { timeAgo } from '../../utils/formatDuration.js';
import Button from '../../components/common/Button.jsx';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn.js';

const Notifications = () => {
  const queryClient = useQueryClient();
  const markAllRead = useNotificationStore((s) => s.markAllRead);

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => userService.getNotifications({ limit: 30 }),
  });

  const markAll = useMutation({
    mutationFn: () => userService.markAllNotificationsRead(),
    onSuccess: () => {
      markAllRead();
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const notifications = data?.data?.notifications || [];

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Notifications</h1>
        <Button variant="secondary" onClick={() => markAll.mutate()}>
          Mark all read
        </Button>
      </div>

      {isLoading && <p className="text-white/40">Loading...</p>}
      {!isLoading && notifications.length === 0 && <p className="text-white/40">You&apos;re all caught up.</p>}

      <div className="space-y-2">
        {notifications.map((n) => (
          <Link
            key={n._id}
            to={n.link || '#'}
            className={cn('glass-card block p-4 text-sm transition-colors hover:bg-white/[0.06]', !n.isRead && 'border-accent-600/50')}
          >
            <p>{n.message}</p>
            <p className="mt-1 text-xs text-white/40">{timeAgo(n.createdAt)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
