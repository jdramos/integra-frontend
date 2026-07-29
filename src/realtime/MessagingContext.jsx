import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import useAuth from '../auth/AuthContext';
import useSocket from './SocketContext';
import { getUnreadMessagesCount } from '../api/messages';

const MessagingContext = createContext(null);
const MESSAGING_ROLES = ['CANDIDATE', 'COMPANY', 'COMPANY_ADMIN', 'COMPANY_USER'];

export function MessagingProvider({ children }) {
  const { user } = useAuth();
  const socket = useSocket();
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnread = useCallback(() => {
    if (!user || !MESSAGING_ROLES.includes(user.role)) {
      setUnreadCount(0);
      return;
    }
    getUnreadMessagesCount().then(setUnreadCount).catch(() => {});
  }, [user]);

  useEffect(() => {
    refreshUnread();
    const timer = setInterval(refreshUnread, 45000);
    return () => clearInterval(timer);
  }, [refreshUnread]);

  useEffect(() => {
    if (!socket || !MESSAGING_ROLES.includes(user?.role)) return undefined;
    const handleNewMessage = () => refreshUnread();
    socket.on('message:new', handleNewMessage);
    return () => socket.off('message:new', handleNewMessage);
  }, [socket, user?.role, refreshUnread]);

  return (
    <MessagingContext.Provider value={{ unreadCount, refreshUnread }}>
      {children}
    </MessagingContext.Provider>
  );
}

export default function useMessaging() {
  return useContext(MessagingContext);
}
