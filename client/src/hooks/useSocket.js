// Convenience wrapper around SocketContext for the chat-room lifecycle: join
// on mount, leave on unmount/streamId change, expose send/typing emitters,
// and mirror server events into streamStore so components just read state.

import { useEffect } from 'react';
import { useSocketContext } from '../context/SocketContext.jsx';
import { useStreamStore } from '../store/streamStore.js';

export const useStreamChat = (streamId) => {
  const { socket } = useSocketContext();
  const setViewerCount = useStreamStore((s) => s.setViewerCount);
  const setMessages = useStreamStore((s) => s.setMessages);
  const addMessage = useStreamStore((s) => s.addMessage);
  const setTypingUser = useStreamStore((s) => s.setTypingUser);
  const clearTypingUser = useStreamStore((s) => s.clearTypingUser);
  const setActiveStream = useStreamStore((s) => s.setActiveStream);

  useEffect(() => {
    if (!socket || !streamId) return undefined;

    setActiveStream(streamId);
    socket.emit('chat:join', { streamId });

    const onHistory = ({ messages }) => setMessages(messages);
    const onMessage = ({ message }) => addMessage(message);
    const onViewerCount = ({ count }) => setViewerCount(count);
    const onTyping = ({ userId, username }) => {
      setTypingUser(userId, username);
      setTimeout(() => clearTypingUser(userId), 3000);
    };

    socket.on('chat:history', onHistory);
    socket.on('chat:message', onMessage);
    socket.on('stream:viewerCount', onViewerCount);
    socket.on('chat:typing', onTyping);

    return () => {
      socket.emit('chat:leave', { streamId });
      socket.off('chat:history', onHistory);
      socket.off('chat:message', onMessage);
      socket.off('stream:viewerCount', onViewerCount);
      socket.off('chat:typing', onTyping);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, streamId]);

  const sendMessage = (content) => socket?.emit('chat:message', { streamId, content });
  const sendTyping = () => socket?.emit('chat:typing', { streamId });

  return { sendMessage, sendTyping };
};
