'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import ProfilePage from '@/views/Profile';

export default function Page() {
  return (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  );
}
