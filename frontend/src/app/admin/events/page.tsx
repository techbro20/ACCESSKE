'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import AdminEvents from '@/views/AdminEvents';

export default function Page() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminEvents />
    </ProtectedRoute>
  );
}
