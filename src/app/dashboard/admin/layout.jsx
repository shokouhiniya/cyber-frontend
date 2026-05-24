'use client';

import { RoleBasedGuard } from 'src/auth/guard';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

/**
 * Client-side gate for every /dashboard/admin/* page.
 * The AuthGuard in the dashboard layout has already enforced authentication.
 */
export default function AdminLayout({ children }) {
  const { user } = useAuthContext();
  return (
    <RoleBasedGuard hasContent currentRole={user?.role} allowedRoles={['super_admin']}>
      {children}
    </RoleBasedGuard>
  );
}
