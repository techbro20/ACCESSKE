import React, { useEffect, useRef } from 'react';
import { BrowserRouter, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRouter from './router';
import './App.css';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const hasRedirected = useRef(false);

  // Ensure app always starts at landing page on initial load
  // BUT don't redirect if user is on register page with invite token
  useEffect(() => {
    // Only redirect once on initial mount
    if (!hasRedirected.current) {
      hasRedirected.current = true;
      // Don't redirect if on register page with token (invite link)
      const isRegisterWithToken = location.pathname === '/register' && 
        new URLSearchParams(location.search).has('token');
      // Don't redirect if on login or register pages
      const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
      
      if (!isRegisterWithToken && !isAuthPage) {
        // Always start at landing page, regardless of URL
        navigate('/', { replace: true });
      }
    }
  }, [navigate, location]);

  return <AppRouter />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
