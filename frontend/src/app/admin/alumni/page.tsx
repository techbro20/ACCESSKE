'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import AdminAlumni from '@/views/AdminAlumni';

export default function Page() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminAlumni />
    </ProtectedRoute>
  );
}
