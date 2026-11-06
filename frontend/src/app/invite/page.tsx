'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import InvitePage from '@/views/Invite';

export default function Page() {
  return (
    <ProtectedRoute requireAdmin>
      <InvitePage />
    </ProtectedRoute>
  );
}
