export type MockRole = 'admin' | 'alumni';

export interface MockAccount {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: MockRole;
  cohort: string;
  phone: string;
  profession: string;
  skills: string[];
}

const STORAGE_KEY = 'acces.mock.accounts';
const DEFAULT_ADMIN_EMAIL = 'admin@acces.org';
const DEFAULT_ADMIN_PASSWORD = 'admin123';

function hasWindowStorage() {
  return typeof window !== 'undefined' && !!window.localStorage;
}

export function loadMockAccounts(): MockAccount[] {
  if (!hasWindowStorage()) return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveMockAccounts(accounts: MockAccount[]) {
  if (!hasWindowStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
}

export function ensureDefaultAdminAccount() {
  const accounts = loadMockAccounts();
  if (accounts.some((acc) => acc.email === DEFAULT_ADMIN_EMAIL)) {
    return;
  }

  accounts.push({
    id: 'mock-admin',
    firstName: 'System',
    lastName: 'Admin',
    email: DEFAULT_ADMIN_EMAIL,
    password: DEFAULT_ADMIN_PASSWORD,
    role: 'admin',
    cohort: 'N/A',
    phone: '',
    profession: 'Administrator',
    skills: []
  });

  saveMockAccounts(accounts);
}

export function findMockAccountByEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  return loadMockAccounts().find((acc) => acc.email.toLowerCase() === normalized);
}

export function findMockAccountById(id: string) {
  return loadMockAccounts().find((acc) => acc.id === id);
}

export function upsertMockAccount(account: MockAccount) {
  const accounts = loadMockAccounts();
  const idx = accounts.findIndex((acc) => acc.id === account.id);
  if (idx >= 0) {
    accounts[idx] = account;
  } else {
    accounts.push(account);
  }
  saveMockAccounts(accounts);
}

export function createMockAccount(data: Omit<MockAccount, 'id'>): MockAccount {
  return {
    ...data,
    id: `mock-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  };
}

