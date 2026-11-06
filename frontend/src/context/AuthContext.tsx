'use client';

import { createContext, useState, ReactNode, useEffect } from 'react';

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  role?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  ready: boolean;
  login: (u: User, t: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthState>({
  user: null,
  token: null,
  ready: false,
  login: () => {},
  logout: () => {}
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('user');
      }
    }
    if (storedToken) {
      setToken(storedToken);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token, ready]);

  useEffect(() => {
    if (!ready) return;
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user, ready]);

  function login(u: User, t: string) {
    setUser(u);
    setToken(t);
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  return (
    <AuthContext.Provider value={{ user, token, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
