import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { adminService } from '../../services/admin.service.js';
import Badge from '../../components/common/Badge.jsx';
import Button from '../../components/common/Button.jsx';

const ManageStreams = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'streams'], queryFn: () => adminService.listStreams({ limit: 30 }) });

  const remove = useMutation({
    mutationFn: (id) => adminService.removeStream(id),
    onSuccess: () => {
      toast.success('Stream removed');
      queryClient.invalidateQueries({ queryKey: ['admin', 'streams'] });
    },
  });

  const streams = data?.data?.streams || [];

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Manage Streams</h1>
      {isLoading && <p className="text-white/40">Loading...</p>}

      <div className="glass-card divide-y divide-white/5">
        {streams.map((s) => (
          <div key={s._id} className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="text-sm font-medium">{s.title}</p>
              <p className="text-xs text-white/40">{s.channel?.channelName}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={s.status === 'live' ? 'live' : 'default'}>{s.status}</Badge>
              <Button
                variant="danger"
                className="px-3 py-1.5 text-xs"
                onClick={() => {
                  if (confirm('Remove this stream?')) remove.mutate(s._id);
                }}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageStreams;
