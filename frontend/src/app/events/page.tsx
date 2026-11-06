'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Events from '@/views/Events';

export default function Page() {
  return (
    <ProtectedRoute>
      <Events />
    </ProtectedRoute>
  );
}
