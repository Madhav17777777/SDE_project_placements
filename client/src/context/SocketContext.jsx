// The one plain React Context in the app (everything else global goes
// through Zustand). A socket connection is a side-effecting singleton with
// its own lifecycle -- opening/closing/reconnecting -- which fits Context +
// a ref better than a store. Reconnects automatically whenever the access
// token changes (login/logout/refresh), carrying the new token so the
// server's optional socket auth (see server/src/sockets/socketAuth.js) can
// re-identify the user.

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore.js';
import { useNotificationStore } from '../store/notificationStore.js';
import toast from 'react-hot-toast';

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const accessToken = useAuthStore((s) => s.accessToken);
  const pushNotification = useNotificationStore((s) => s.pushNotification);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      auth: accessToken ? { token: accessToken } : {},
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('notification:new', ({ notification }) => {
      pushNotification(notification);
      toast(notification.message, { icon: '🔔' });
    });

    socket.on('stream:live', ({ channel, stream }) => {
      toast.success(`${channel.channelName} just went live: ${stream.title}`);
    });

    socketRef.current = socket;
    return () => socket.disconnect();
  }, [accessToken, pushNotification]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocketContext must be used within a SocketProvider');
  return ctx;
};
