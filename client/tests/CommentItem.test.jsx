import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CommentItem from '../src/components/video/CommentItem.jsx';

const baseComment = {
  _id: 'c1',
  content: 'Great stream!',
  author: { username: 'viewer1', avatar: '' },
  likesCount: 3,
  isPinned: false,
  createdAt: new Date().toISOString(),
  replies: [],
  replyCount: 0,
};

describe('CommentItem', () => {
  it('renders the author, content, and like count', () => {
    render(<CommentItem comment={baseComment} />);
    expect(screen.getByText('viewer1')).toBeInTheDocument();
    expect(screen.getByText('Great stream!')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('shows a "Pinned" label when isPinned is true', () => {
    render(<CommentItem comment={{ ...baseComment, isPinned: true }} />);
    expect(screen.getByText('Pinned')).toBeInTheDocument();
  });

  it('calls onLike with the comment id when the like button is clicked', () => {
    const onLike = vi.fn();
    render(<CommentItem comment={baseComment} onLike={onLike} />);
    fireEvent.click(screen.getByText('3'));
    expect(onLike).toHaveBeenCalledWith('c1');
  });

  it('opens a reply box and submits a reply', () => {
    const onReply = vi.fn();
    render(<CommentItem comment={baseComment} onReply={onReply} />);

    fireEvent.click(screen.getByText('Reply'));
    const input = screen.getByPlaceholderText('Write a reply...');
    fireEvent.change(input, { target: { value: 'I agree!' } });
    fireEvent.submit(input.closest('form'));

    expect(onReply).toHaveBeenCalledWith('c1', 'I agree!');
  });

  it('renders nested replies', () => {
    const withReplies = {
      ...baseComment,
      replies: [
        { _id: 'r1', content: 'Totally', author: { username: 'viewer2' }, likesCount: 0, createdAt: new Date().toISOString() },
      ],
      replyCount: 1,
    };
    render(<CommentItem comment={withReplies} />);
    expect(screen.getByText('Totally')).toBeInTheDocument();
  });
});
