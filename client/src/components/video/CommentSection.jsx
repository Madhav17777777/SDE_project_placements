import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { videoService } from '../../services/video.service.js';
import { useAuth } from '../../hooks/useAuth.js';
import CommentItem from './CommentItem.jsx';
import Button from '../common/Button.jsx';
import Skeleton from '../common/Skeleton.jsx';
import toast from 'react-hot-toast';

const CommentSection = ({ videoId }) => {
  const [text, setText] = useState('');
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['comments', videoId],
    queryFn: () => videoService.getComments(videoId),
    enabled: Boolean(videoId),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['comments', videoId] });

  const addComment = useMutation({
    mutationFn: (content) => videoService.addComment(videoId, content),
    onSuccess: () => {
      setText('');
      invalidate();
    },
    onError: () => toast.error('Could not post comment'),
  });

  const reply = useMutation({
    mutationFn: ({ commentId, content }) => videoService.reply(commentId, content),
    onSuccess: invalidate,
  });

  const like = useMutation({
    mutationFn: (commentId) => videoService.reactToComment(commentId),
    onSuccess: invalidate,
  });

  const comments = data?.data?.comments || [];

  return (
    <div>
      <h3 className="mb-4 text-lg font-semibold">{data?.data?.meta?.totalCount ?? 0} Comments</h3>

      {isAuthenticated ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (text.trim()) addComment.mutate(text.trim());
          }}
          className="mb-6 flex gap-3"
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment..."
            className="input-field flex-1"
          />
          <Button type="submit" isLoading={addComment.isPending}>
            Comment
          </Button>
        </form>
      ) : (
        <p className="mb-6 text-sm text-white/50">Log in to join the conversation.</p>
      )}

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : (
        comments.map((comment) => (
          <CommentItem
            key={comment._id}
            comment={comment}
            onReply={(commentId, content) => reply.mutate({ commentId, content })}
            onLike={(commentId) => like.mutate(commentId)}
          />
        ))
      )}
    </div>
  );
};

export default CommentSection;
