'use client';

/**
 * AdminDesktopMode context
 *
 * `desktopMode` is true on wide screens (≥ lg). Admin pages use it to switch
 * between card lists (mobile) and tables / multi-column layouts (desktop).
 * It used to be a manual toggle while the app was locked to a phone frame;
 * now that the app is responsive it simply follows the viewport width.
 *
 * Usage:
 *   const { desktopMode } = useAdminDesktopMode();
 */

import { useMemo, useContext, createContext } from 'react';

import useMediaQuery from '@mui/material/useMediaQuery';

const AdminDesktopModeContext = createContext({
  desktopMode: false,
  toggleDesktopMode: () => {},
});

export function AdminDesktopModeProvider({ children }) {
  const desktopMode = useMediaQuery('(min-width:1200px)', { noSsr: true });

  const value = useMemo(() => ({ desktopMode, toggleDesktopMode: () => {} }), [desktopMode]);

  return (
    <AdminDesktopModeContext.Provider value={value}>
      {children}
    </AdminDesktopModeContext.Provider>
  );
}

export function useAdminDesktopMode() {
  return useContext(AdminDesktopModeContext);
}
