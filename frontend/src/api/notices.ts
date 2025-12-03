import { request } from '../utils/request';

export async function getNotices() {
  return request('/api/notices', { method: 'GET' });
}
