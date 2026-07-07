import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { adminService } from '../../services/admin.service.js';
import Avatar from '../../components/common/Avatar.jsx';
import Button from '../../components/common/Button.jsx';

const ManageUsers = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'users'], queryFn: () => adminService.listUsers({ limit: 30 }) });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });

  const toggleBan = useMutation({
    mutationFn: ({ id, isBanned }) => adminService.banUser(id, isBanned),
    onSuccess: invalidate,
  });

  const deleteUser = useMutation({
    mutationFn: (id) => adminService.deleteUser(id),
    onSuccess: () => {
      toast.success('User deleted');
      invalidate();
    },
  });

  const users = data?.data?.users || [];

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Manage Users</h1>
      {isLoading && <p className="text-white/40">Loading...</p>}

      <div className="glass-card divide-y divide-white/5">
        {users.map((u) => (
          <div key={u.id} className="flex items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-3">
              <Avatar src={u.avatar} name={u.username} size="sm" />
              <div>
                <p className="text-sm font-medium">{u.username}</p>
                <p className="text-xs text-white/40">
                  {u.email} &middot; {u.role}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="px-3 py-1.5 text-xs"
                onClick={() => toggleBan.mutate({ id: u.id, isBanned: !u.isBanned })}
              >
                {u.isBanned ? 'Unban' : 'Ban'}
              </Button>
              <Button
                variant="danger"
                className="px-3 py-1.5 text-xs"
                onClick={() => {
                  if (confirm(`Delete ${u.username}? This cannot be undone.`)) deleteUser.mutate(u.id);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageUsers;
