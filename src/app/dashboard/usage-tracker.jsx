'use client';

import { usePageView } from 'src/hooks/use-page-view';

// ----------------------------------------------------------------------

/**
 * Headless client component that fires a `page_view` usage event on route change.
 * Mounted inside the dashboard layout.
 */
export function UsageTracker() {
  usePageView();
  return null;
}
