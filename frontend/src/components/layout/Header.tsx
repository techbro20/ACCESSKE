'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push('/');
  }

  return (
    <header className="bg-acces-black text-acces-beige px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-md">
      <Link
        href="/"
        className="flex items-center gap-3 text-acces-beige no-underline font-bold hover:opacity-80 transition-opacity"
      >
        <img
          src="/accs logo.PNG"
          alt="ACCES Kenya Logo"
          className="h-10 w-auto object-contain"
        />
        <span className="text-lg sm:text-xl">Alumni</span>
      </Link>
      <nav className="flex flex-wrap gap-4 sm:gap-5 items-center justify-center sm:justify-end">
        {user ? (
          <>
            <Link 
              className="text-acces-beige no-underline hover:text-acces-red transition-colors text-sm sm:text-base font-medium" 
              href="/dashboard"
            >
              Alumni Dashboard
            </Link>
            {user.role === 'admin' && (
              <Link 
                className="text-acces-beige no-underline hover:text-acces-red transition-colors text-sm sm:text-base font-medium" 
                href="/admin"
              >
                Admin Dashboard
              </Link>
            )}
            <Link 
              className="text-acces-beige no-underline hover:text-acces-red transition-colors text-sm sm:text-base" 
              href="/profile"
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="bg-transparent border border-acces-beige text-acces-beige px-3 py-1.5 cursor-pointer rounded hover:bg-acces-beige hover:text-acces-black transition-colors text-sm sm:text-base"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link 
              className="text-acces-beige no-underline hover:text-acces-red transition-colors text-sm sm:text-base" 
              href="/"
            >
              Home
            </Link>
            <Link 
              className="text-acces-beige no-underline hover:text-acces-red transition-colors text-sm sm:text-base" 
              href="/login"
            >
              Login
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
