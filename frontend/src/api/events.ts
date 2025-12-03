import { request } from '../utils/request';

export async function getEvents() {
  return request('/api/events', { method: 'GET' });
}

export async function createEvent(data: {
  title: string;
  date: string;
  venue: string;
  description: string;
}) {
  return request('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}
