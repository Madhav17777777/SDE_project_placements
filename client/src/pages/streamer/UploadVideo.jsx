import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { videoService } from '../../services/video.service.js';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';

const UploadVideo = () => {
  const [progress, setProgress] = useState(0);
  const [videoFile, setVideoFile] = useState(null);
  const { register, handleSubmit, reset } = useForm();

  const upload = useMutation({
    mutationFn: (formData) =>
      videoService.upload(formData, (evt) => setProgress(Math.round((evt.loaded * 100) / evt.total))),
    onSuccess: () => {
      toast.success('Video uploaded!');
      reset();
      setVideoFile(null);
      setProgress(0);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Upload failed'),
  });

  const onSubmit = (values) => {
    if (!videoFile) return toast.error('Choose a video file first');

    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('title', values.title);
    formData.append('description', values.description || '');
    upload.mutate(formData);
  };

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-xl font-semibold">Upload Video</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="glass-card space-y-4 p-5">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-white/70">Video file</span>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-white/70 file:mr-4 file:rounded-lg file:border-0 file:bg-accent-600 file:px-4 file:py-2 file:text-white"
          />
        </label>

        <Input label="Title" placeholder="My awesome video" {...register('title', { required: true })} />
        <Input label="Description" placeholder="What's this video about?" {...register('description')} />

        {upload.isPending && (
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-accent-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}

        <Button type="submit" isLoading={upload.isPending} className="w-full">
          Upload
        </Button>
      </form>
    </div>
  );
};

export default UploadVideo;
