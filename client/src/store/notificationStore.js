// Holds the unread badge count and a rolling feed of realtime notifications.
// Populated two ways: an initial REST fetch (useAuth/Navbar on mount) and
// live pushes from the `notification:new` socket event (see useSocket.js).

import { create } from 'zustand';

export const useNotificationStore = create((set) => ({
  unreadCount: 0,
  recent: [],

  setUnreadCount: (unreadCount) => set({ unreadCount }),
  setRecent: (recent) => set({ recent }),
  pushNotification: (notification) =>
    set((s) => ({
      recent: [notification, ...s.recent].slice(0, 20),
      unreadCount: s.unreadCount + 1,
    })),
  markAllRead: () => set({ unreadCount: 0 }),
}));
