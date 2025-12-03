import { request } from '../utils/request';
import {
  createMockAccount,
  ensureDefaultAdminAccount,
  findMockAccountByEmail,
  upsertMockAccount
} from './mockAccounts';

// TEMPORARY: Bypass real API auth while backend/DB is not connected.
// Set REACT_APP_BYPASS_AUTH=false to use the real API once it is ready.
export const BYPASS_AUTH = process.env.REACT_APP_BYPASS_AUTH !== 'false';

export async function loginAPI(email: string, password: string) {
  if (BYPASS_AUTH) {
    ensureDefaultAdminAccount();
    const account = findMockAccountByEmail(email);
    if (!account) {
      return Promise.reject(new Error('Account not found. Please register first.'));
    }

    if (account.password !== password) {
      return Promise.reject(new Error('Incorrect email or password.'));
    }

    const { password: _pw, ...user } = account;
    return Promise.resolve({
      user,
      token: `mock-token-${account.id}`
    });
  }

  return request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
}

export async function registerAPI(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  inviteToken?: string;
}) {
  if (BYPASS_AUTH) {
    const existing = findMockAccountByEmail(data.email);
    if (existing) {
      return Promise.reject(new Error('An account with this email already exists.'));
    }

    const newAccount = createMockAccount({
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.trim(),
      password: data.password,
      role: data.email.toLowerCase().includes('admin') ? 'admin' : 'alumni',
      cohort: 'Not set',
      phone: '',
      profession: '',
      skills: []
    });

    upsertMockAccount(newAccount);
    return Promise.resolve({ success: true });
  }

  return request('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}
