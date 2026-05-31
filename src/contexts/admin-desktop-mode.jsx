'use client';

/**
 * AdminDesktopMode context
 *
 * Provides a persistent toggle for switching admin pages between
 * mobile (default) and desktop layout. State is stored in localStorage
 * so it survives page reloads.
 *
 * Usage:
 *   const { desktopMode, toggleDesktopMode } = useAdminDesktopMode();
 */

import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const STORAGE_KEY = 'admin_desktop_mode';

const AdminDesktopModeContext = createContext({
  desktopMode: false,
  toggleDesktopMode: () => {},
});

export function AdminDesktopModeProvider({ children }) {
  const [desktopMode, setDesktopMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    try { return localStorage.getItem(STORAGE_KEY) === 'true'; } catch { return false; }
  });

  const toggleDesktopMode = useCallback(() => {
    setDesktopMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
        // Notify ScreenSize (same tab) since storage events don't fire in the same tab
        window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY, newValue: String(next) }));
      } catch { /* ignore */ }
      return next;
    });
  }, []);

  const value = useMemo(() => ({ desktopMode, toggleDesktopMode }), [desktopMode, toggleDesktopMode]);

  return (
    <AdminDesktopModeContext.Provider value={value}>
      {children}
    </AdminDesktopModeContext.Provider>
  );
}

export function useAdminDesktopMode() {
  return useContext(AdminDesktopModeContext);
}
