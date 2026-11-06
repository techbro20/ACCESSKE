'use client';

import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { createChatSocket } from '../api/chat';

export interface ChatMessage {
  id?: string;
  sender: string;
  sender_id?: string;
  text: string;
  timestamp?: string;
  edited?: boolean;
}

interface UseChatSocketOptions {
  userId?: string;
  enabled?: boolean;
}

export function useChatSocket({ userId, enabled = true }: UseChatSocketOptions) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (!enabled || !userId) return;

    const socketInstance = createChatSocket(userId);
    setSocket(socketInstance);

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    const onConnectError = () => setIsConnected(false);

    const onMessage = (msg: ChatMessage) => {
      setMessages((prev) => {
        if (msg.id && prev.some((m) => m.id === msg.id)) {
          return prev;
        }
        return [...prev, msg];
      });
    };

    const onUpdated = (msg: ChatMessage) => {
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? msg : m)));
    };

    const onDeleted = (data: { id: string }) => {
      setMessages((prev) => prev.filter((m) => m.id !== data.id));
    };

    const onCleared = () => setMessages([]);

    const onError = (error: { message?: string }) => {
      console.error('Socket.IO error:', error);
      setIsConnected(false);
    };

    socketInstance.on('connect', onConnect);
    socketInstance.on('disconnect', onDisconnect);
    socketInstance.on('connect_error', onConnectError);
    socketInstance.on('message', onMessage);
    socketInstance.on('message_updated', onUpdated);
    socketInstance.on('message_deleted', onDeleted);
    socketInstance.on('messages_cleared', onCleared);
    socketInstance.on('error', onError);

    return () => {
      socketInstance.off('connect', onConnect);
      socketInstance.off('disconnect', onDisconnect);
      socketInstance.off('connect_error', onConnectError);
      socketInstance.off('message', onMessage);
      socketInstance.off('message_updated', onUpdated);
      socketInstance.off('message_deleted', onDeleted);
      socketInstance.off('messages_cleared', onCleared);
      socketInstance.off('error', onError);
      socketInstance.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [userId, enabled]);

  return {
    socket,
    isConnected,
    messages,
    setMessages
  };
}
