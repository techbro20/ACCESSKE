import { request } from '../utils/request';

export async function getClientProfile(id: string) {
  return request(`/api/client/${id}`, { method: 'GET' });
}

export async function updateClientProfile(id: string, data: any) {
  return request(`/api/client/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

export async function getClientList() {
  return request('/api/client', { method: 'GET' });
}
