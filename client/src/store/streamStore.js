// Live, ephemeral state for whichever stream page is currently open --
// viewer count and chat messages arrive over the socket much faster than
// React Query's cache invalidation is meant to handle, so they get their own
// lightweight store instead of being shoved into the query cache.

import { create } from 'zustand';

export const useStreamStore = create((set) => ({
  activeStreamId: null,
  viewerCount: 0,
  messages: [],
  typingUsers: {}, // { [userId]: username }, pruned on a timer by ChatBox

  setActiveStream: (streamId) => set({ activeStreamId: streamId, viewerCount: 0, messages: [], typingUsers: {} }),
  setViewerCount: (viewerCount) => set({ viewerCount }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),
  setTypingUser: (userId, username) =>
    set((s) => ({ typingUsers: { ...s.typingUsers, [userId]: username } })),
  clearTypingUser: (userId) =>
    set((s) => {
      const next = { ...s.typingUsers };
      delete next[userId];
      return { typingUsers: next };
    }),
}));
