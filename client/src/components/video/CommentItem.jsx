import { useState } from 'react';
import { motion } from 'framer-motion';
import { IoHeartOutline, IoHeart, IoPin } from 'react-icons/io5';
import { timeAgo } from '../../utils/formatDuration.js';
import Avatar from '../common/Avatar.jsx';
import Button from '../common/Button.jsx';

const CommentItem = ({ comment, onReply, onLike, isReply = false }) => {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState('');

  const submitReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onReply?.(comment._id, replyText.trim());
    setReplyText('');
    setShowReplyBox(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={isReply ? 'ml-12 mt-3' : 'mb-5'}>
      <div className="flex gap-3">
        <Avatar src={comment.author?.avatar} name={comment.author?.username} size={isReply ? 'sm' : 'md'} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{comment.author?.username}</span>
            <span className="text-xs text-white/40">{timeAgo(comment.createdAt)}</span>
            {comment.isPinned && (
              <span className="flex items-center gap-1 text-xs text-accent-glow">
                <IoPin size={12} /> Pinned
              </span>
            )}
          </div>
          <p className="mt-0.5 whitespace-pre-wrap break-words text-sm text-white/90">{comment.content}</p>
          <div className="mt-1 flex items-center gap-4 text-xs text-white/50">
            <button onClick={() => onLike?.(comment._id)} className="flex items-center gap-1 hover:text-accent-glow">
              {comment.likesCount > 0 ? <IoHeart size={14} /> : <IoHeartOutline size={14} />}
              {comment.likesCount > 0 && comment.likesCount}
            </button>
            {!isReply && (
              <button onClick={() => setShowReplyBox((v) => !v)} className="hover:text-accent-glow">
                Reply
              </button>
            )}
          </div>

          {showReplyBox && (
            <form onSubmit={submitReply} className="mt-2 flex gap-2">
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="input-field flex-1 py-1.5 text-sm"
                autoFocus
              />
              <Button type="submit" variant="primary" className="px-3 py-1.5 text-sm">
                Reply
              </Button>
            </form>
          )}

          {comment.replies?.map((reply) => (
            <CommentItem key={reply._id} comment={reply} isReply onLike={onLike} />
          ))}
          {comment.replyCount > (comment.replies?.length || 0) && (
            <button className="ml-12 mt-2 text-xs font-medium text-accent-glow hover:underline">
              View {comment.replyCount - (comment.replies?.length || 0)} more repl
              {comment.replyCount - (comment.replies?.length || 0) === 1 ? 'y' : 'ies'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CommentItem;
