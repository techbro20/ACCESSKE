'use client';

import { io, Socket } from 'socket.io-client';
import { request } from '../utils/request';

export async function getChatMessages(limit: number = 50) {
  return request(`/api/chat/messages?limit=${limit}`, { method: 'GET' });
}

function resolveSocketUrl(): string {
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const raw = (wsUrl || apiUrl).replace(/\/$/, '');
  // socket.io-client expects http(s); it upgrades to ws(s) itself
  if (raw.startsWith('wss://')) return `https://${raw.slice(6)}`;
  if (raw.startsWith('ws://')) return `http://${raw.slice(5)}`;
  return raw;
}

export function createChatSocket(userId: string): Socket {
  return io(resolveSocketUrl(), {
    auth: {
      user_id: userId
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: Infinity
  });
}

export function sendChatMessage(socket: Socket, text: string) {
  socket.emit('message', { text });
}

export async function editChatMessage(messageId: string, text: string) {
  return request(`/api/chat/messages/${messageId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
}

export async function deleteChatMessage(messageId: string) {
  return request(`/api/chat/messages/${messageId}`, {
    method: 'DELETE'
  });
}

export async function clearAllMessages() {
  return request('/api/chat/messages', {
    method: 'DELETE'
  });
}
