import { request } from '../utils/request';
import { BYPASS_AUTH } from './auth';
import { findMockAccountById, upsertMockAccount } from './mockAccounts';

export async function getProfile() {
  if (BYPASS_AUTH) {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      return Promise.reject(new Error('You are not logged in.'));
    }

    const { id } = JSON.parse(storedUser);
    const account = findMockAccountById(id);
    if (!account) {
      return Promise.reject(new Error('Profile not found.'));
    }

    const { password: _pw, ...profile } = account;
    return Promise.resolve(profile);
  }

  return request('/api/alumni/me', { method: 'GET' });
}

export async function updateProfile(data: any) {
  if (BYPASS_AUTH) {
    if (!data?.id) {
      return Promise.reject(new Error('Profile id is required.'));
    }

    const existing = findMockAccountById(data.id);
    if (!existing) {
      return Promise.reject(new Error('Profile not found.'));
    }

    const updated = {
      ...existing,
      firstName: data.firstName ?? existing.firstName,
      lastName: data.lastName ?? existing.lastName,
      phone: data.phone ?? existing.phone,
      profession: data.profession ?? existing.profession,
      skills: Array.isArray(data.skills) ? data.skills : existing.skills
    };

    upsertMockAccount(updated);

    localStorage.setItem(
      'user',
      JSON.stringify({
        id: updated.id,
        firstName: updated.firstName,
        lastName: updated.lastName,
        email: updated.email,
        role: updated.role
      })
    );

    return Promise.resolve(updated);
  }

  return request('/api/alumni/me', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}
