import { request } from '../utils/request';

export async function getAdminStats() {
  return request('/api/reports/stats', { method: 'GET' });
}

export async function getAlumniByCohort() {
  return request('/api/reports/cohort', { method: 'GET' });
}

export async function getRegistrationTrends() {
  return request('/api/reports/trends', { method: 'GET' });
}
