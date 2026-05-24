'use client';

import { use } from 'react';

import { ProfileScopeContext } from '../context/profile-scope-context';

// ----------------------------------------------------------------------

export function useProfileScope() {
  const context = use(ProfileScopeContext);

  if (!context) {
    throw new Error('useProfileScope: Context must be used inside ProfileScopeProvider');
  }

  return context;
}
