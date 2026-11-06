'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import AdminReports from '@/views/AdminReports';

export default function Page() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminReports />
    </ProtectedRoute>
  );
}
