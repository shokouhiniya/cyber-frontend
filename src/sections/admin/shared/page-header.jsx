'use client';

import { PageHeader } from 'src/sections/cyberspace/shared/page-header';

// ----------------------------------------------------------------------

/**
 * Admin wrapper around the shared PageHeader: same typography as the
 * monitoring pages, never shows the selected profile, primary action on the
 * far side.
 */
export function AdminPageHeader({ title, subtitle, action, sx }) {
  return (
    <PageHeader
      title={title}
      description={subtitle}
      actions={action}
      showProfile={false}
      sx={sx}
    />
  );
}
