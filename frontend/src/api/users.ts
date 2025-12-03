import { request } from '../utils/request';

export async function getAllUsers() {
  return request('/api/admin/users', { method: 'GET' });
}

export async function updateUserStatus(id: string, active: boolean) {
  return request(`/api/admin/users/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ active })
  });
}

export async function deleteUser(id: string) {
  return request(`/api/admin/users/${id}`, {
    method: 'DELETE'
  });
}