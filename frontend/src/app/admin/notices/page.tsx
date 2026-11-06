'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import AdminNotices from '@/views/AdminNotices';

export default function Page() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminNotices />
    </ProtectedRoute>
  );
}
