'use client';

import { useAdminProfiles } from 'src/api/admin';

import { useAuthContext, useProfileScope } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export const ROLE_OPTIONS = [
  { value: 'super_admin', label: 'مدیرکل' },
  { value: 'client_admin', label: 'مدیر مشتری' },
  { value: 'client_viewer', label: 'کارشناس' },
];

export const ROLE_LABELS = Object.fromEntries(ROLE_OPTIONS.map((r) => [r.value, r.label]));

/**
 * What the current admin may do on the users page. Mirrors the backend rules
 * in AdminUsersService: a client_admin only hands out client roles, only links
 * their own profiles, never edits organisations, and cannot change their own
 * role or deactivate themselves.
 */
export function useUsersScope() {
  const { user } = useAuthContext();
  const isSuperAdmin = user?.role === 'super_admin';

  // /admin/profiles is super_admin-only; a client_admin picks from their own profiles
  const { data: allProfiles = [] } = useAdminProfiles({ enabled: isSuperAdmin });
  const { profiles: ownProfiles = [] } = useProfileScope();

  return {
    me: user,
    isSuperAdmin,
    profiles: isSuperAdmin ? allProfiles : ownProfiles,
    roleOptions: isSuperAdmin ? ROLE_OPTIONS : ROLE_OPTIONS.filter((r) => r.value !== 'super_admin'),
    canEditOrganization: isSuperAdmin,
    isSelf: (u) => !!u?.id && u.id === user?.id,
  };
}
