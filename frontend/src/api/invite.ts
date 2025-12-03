import { request } from '../utils/request';

export async function generateInvite() {
  return request('/api/invite/generate', { method: 'POST' });
}

export async function getInviteList() {
  return request('/api/invite/list', { method: 'GET' });
}
