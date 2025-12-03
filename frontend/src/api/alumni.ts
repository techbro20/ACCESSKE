import { request } from '../utils/request';

export async function getAlumniList() {
  return request('/api/alumni', { method: 'GET' });
}

export async function getAlumniById(id: string) {
  return request(`/api/alumni/${id}`, { method: 'GET' });
}

export async function updateAlumni(id: string, data: any) {
  return request(`/api/alumni/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

export async function searchAlumni(query: string) {
  return request(`/api/alumni/search?q=${encodeURIComponent(query)}`, {
    method: 'GET'
  });
}
