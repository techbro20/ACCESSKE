'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import AdminUsers from '@/views/AdminUsers';

export default function Page() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminUsers />
    </ProtectedRoute>
  );
}
