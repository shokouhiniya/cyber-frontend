'use client';

import { useEffect } from 'react';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

// ----------------------------------------------------------------------

/**
 * Redirects to the dashboard root when the current user's role is not in
 * allowedRoles. Silent redirect — no error page shown.
 */
export function RoleBasedGuard({ children, currentRole, allowedRoles }) {
  const router = useRouter();
  const denied = currentRole && allowedRoles && !allowedRoles.includes(currentRole);

  useEffect(() => {
    if (denied) {
      router.replace(paths.dashboard.root);
    }
  }, [denied, router]);

  if (denied) return null;

  return <>{children}</>;
}
