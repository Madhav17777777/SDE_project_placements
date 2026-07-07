import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { streamService } from '../../services/stream.service.js';
import GoLiveButton from '../../components/stream/GoLiveButton.jsx';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import { formatNumber } from '../../utils/formatNumber.js';

const StreamManager = () => {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm();

  // NOTE: there's no "list my streams" endpoint in the API design (streams
  // are looked up by channel slug or by id) -- for the dashboard MVP we
  // create-then-manage the most recently created stream in this session.
  const [currentStream, setCurrentStream] = useState(null);

  const { data: scheduledData } = useQuery({
    queryKey: ['myStreams', 'scheduled'],
    queryFn: () => streamService.getScheduled({ limit: 5 }),
  });

  const createStream = useMutation({
    mutationFn: (payload) => streamService.create(payload),
    onSuccess: ({ data }) => {
      setCurrentStream(data.stream);
      setShowForm(false);
      reset();
      queryClient.invalidateQueries({ queryKey: ['myStreams'] });
      toast.success('Stream created — go live whenever you are ready');
    },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Stream Manager</h1>
        <Button onClick={() => setShowForm((v) => !v)} variant="secondary">
          {showForm ? 'Cancel' : 'New Stream'}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit((v) => createStream.mutate(v))} className="glass-card mb-6 space-y-4 p-5">
          <Input label="Stream title" placeholder="Building StreamVerse live!" {...register('title', { required: true })} />
          <Input label="Tags (comma separated)" placeholder="coding, mern, live" {...register('tagsRaw')} />
          <Button type="submit" isLoading={createStream.isPending}>
            Create stream
          </Button>
        </form>
      )}

      {currentStream && (
        <div className="glass-card mb-6 flex items-center justify-between p-5">
          <div>
            <p className="font-medium">{currentStream.title}</p>
            <p className="text-sm text-white/50">Status: {currentStream.status}</p>
          </div>
          <GoLiveButton stream={currentStream} />
        </div>
      )}

      <h2 className="mb-3 font-medium text-white/70">Scheduled Streams</h2>
      <div className="space-y-2">
        {(scheduledData?.data?.streams || []).map((s) => (
          <div key={s._id} className="glass-card flex items-center justify-between p-4">
            <div>
              <p className="font-medium">{s.title}</p>
              <p className="text-xs text-white/40">{formatNumber(s.viewerCount)} peak viewers historically</p>
            </div>
          </div>
        ))}
        {(scheduledData?.data?.streams || []).length === 0 && <p className="text-sm text-white/40">No scheduled streams.</p>}
      </div>
    </div>
  );
};

export default StreamManager;
