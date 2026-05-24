'use client';

import { useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';

import { recordUsageEvent } from 'src/api/admin';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

/**
 * Fires a `page_view` usage event every time the route changes, for any
 * authenticated user. Mount it once in the dashboard layout.
 */
export function usePageView() {
  const pathname = usePathname();
  const { authenticated } = useAuthContext();
  const lastRef = useRef(null);

  useEffect(() => {
    if (!authenticated || !pathname) return;
    if (lastRef.current === pathname) return;
    lastRef.current = pathname;

    recordUsageEvent({
      eventType: 'page_view',
      eventName: pathname.startsWith('/dashboard/admin')
        ? `admin.${pathname.replace('/dashboard/admin/', '').replace(/\//g, '.') || 'root'}`
        : `dashboard.${pathname.replace('/dashboard/', '').replace(/\//g, '.') || 'root'}`,
      metadata: { path: pathname },
    });
  }, [pathname, authenticated]);
}
