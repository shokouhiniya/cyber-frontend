'use client';

import { createContext } from 'react';

// ----------------------------------------------------------------------

/**
 * Holds the profile the current viewer is scoped to.
 * - super_admin can switch between profiles via ProfileSwitcher.
 * - client_admin / client_viewer auto-lock to their single linked profile.
 */
export const ProfileScopeContext = createContext(undefined);
