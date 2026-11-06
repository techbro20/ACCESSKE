'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Notices from '@/views/Notices';

export default function Page() {
  return (
    <ProtectedRoute>
      <Notices />
    </ProtectedRoute>
  );
}
