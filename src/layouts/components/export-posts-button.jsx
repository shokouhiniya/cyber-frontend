'use client';

import { useState } from 'react';

import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';

import { CONFIG } from 'src/global-config';
import { Iconify } from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import { useProfileScope } from 'src/auth/hooks';

// ----------------------------------------------------------------------

/**
 * Downloads all saved posts for the current profile as a CSV file.
 * Visible to super_admin and client_admin.
 * The file includes: source, screen name, date, sentiment, relevance,
 * political spectrum, engagement counts, selection reason, and full text.
 */
export function ExportPostsButton() {
  const { user } = useAuthContext();
  const { activeProfileId } = useProfileScope();
  const [loading, setLoading] = useState(false);

  const canExport = user?.role === 'super_admin' || user?.role === 'client_admin';

  const handleExport = async () => {
    if (!canExport || loading) return;
    setLoading(true);
    try {
      // Build the URL with the profile header baked in as a query param
      // (fetch doesn't send custom headers for file downloads, so we use
      // the profileId query param that ProfileScopeMiddleware also accepts)
      const profileParam = activeProfileId ? `?profileId=${activeProfileId}` : '';
      const url = `${CONFIG.serverUrl}/api/ingest/export-posts${profileParam}`;

      // Fetch with auth header
      const token = sessionStorage.getItem('jwt_access_token');
      const res = await fetch(url, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          ...(activeProfileId ? { 'X-Profile-Id': activeProfileId } : {}),
        },
      });

      if (!res.ok) throw new Error(`Export failed: ${res.status}`);

      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `posts-export-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    } catch (e) {
      console.error('Export failed:', e);
    } finally {
      setLoading(false);
    }
  };

  if (!canExport) return null;

  return (
    <Tooltip title="دانلود پست‌های ذخیره‌شده (CSV)" arrow>
      <span>
        <IconButton
          size="small"
          onClick={handleExport}
          disabled={loading}
          sx={{ color: loading ? 'text.disabled' : 'text.secondary' }}
        >
          <Iconify
            icon={loading ? 'solar:refresh-bold' : 'solar:download-bold-duotone'}
            width={18}
            sx={loading ? {
              animation: 'spin 1s linear infinite',
              '@keyframes spin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
            } : {}}
          />
        </IconButton>
      </span>
    </Tooltip>
  );
}
