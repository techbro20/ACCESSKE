'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import AlumniDashboard from '@/views/AlumniDashboard';

export default function Page() {
  return (
    <ProtectedRoute>
      <AlumniDashboard />
    </ProtectedRoute>
  );
}
