'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { alpha, useTheme } from '@mui/material/styles';

import axios from 'src/lib/axios';

import { Iconify } from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

/**
 * Compact "refresh data" button for the dashboard header.
 * Replaces the previous IngestStatusBanner. Always visible to authenticated
 * client_admin / super_admin users; client_viewer accounts don't see it.
 *
 * Behavior:
 *   - Polls /api/ingest/latest-run periodically.
 *   - Shows a green dot when the last run was successful, red when failed,
 *     blue spinning icon when in flight, grey otherwise.
 *   - Tooltip shows the last-run timestamp + status.
 *   - Click triggers /api/ingest/run-now (15-min cooldown enforced server-side).
 */
export function IngestRefreshButton() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { user } = useAuthContext();
  const [polling, setPolling] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Only admins (super_admin + client_admin) can trigger ingest
  const canRun = user?.role === 'super_admin' || user?.role === 'client_admin';

  const { data: latestRun } = useQuery({
    queryKey: ['ingest-latest-run'],
    queryFn: async () => {
      try {
        const res = await axios.get('/api/ingest/latest-run');
        return res.data;
      } catch {
        return null;
      }
    },
    refetchInterval: polling ? 3000 : 60_000,
    enabled: !!user,
    retry: false,
  });

  const status = latestRun?.status;
  const isRunning = status === 'running';
  const isFailed = status === 'failed';
  const isCompleted = status === 'completed';

  // Stop polling once a run finishes; refresh dashboard queries on success
  useEffect(() => {
    if (polling && status && status !== 'running') {
      setPolling(false);
      if (status === 'completed') {
        queryClient.invalidateQueries();
      }
    }
  }, [polling, status, queryClient]);

  // Auto-clear transient errors after 5s
  useEffect(() => {
    if (!errorMsg) return undefined;
    const timer = setTimeout(() => setErrorMsg(''), 5000);
    return () => clearTimeout(timer);
  }, [errorMsg]);

  const handleClick = useCallback(async () => {
    if (!canRun || isRunning) return;
    setErrorMsg('');
    try {
      await axios.post('/api/ingest/run-now');
      setPolling(true);
    } catch (e) {
      setErrorMsg(e?.response?.data?.message || 'خطا در شروع جمع‌آوری');
    }
  }, [canRun, isRunning]);

  if (!user || !canRun) return null;

  // Build tooltip text
  let tooltip = 'بروزرسانی داده‌ها';
  if (isRunning) {
    tooltip = 'در حال جمع‌آوری داده...';
  } else if (errorMsg) {
    tooltip = errorMsg;
  } else if (latestRun?.startedAt) {
    const when = new Date(latestRun.finishedAt || latestRun.startedAt);
    const formatted = when.toLocaleString('fa-IR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Tehran',
    });
    if (isCompleted) {
      tooltip = `آخرین بروزرسانی: ${formatted} (${latestRun.postsSelected ?? 0} پست) — برای اجرای مجدد کلیک کنید`;
    } else if (isFailed) {
      tooltip = `آخرین تلاش ناموفق: ${formatted} — برای تلاش مجدد کلیک کنید`;
    }
  } else {
    tooltip = 'هنوز داده‌ای جمع‌آوری نشده — برای شروع کلیک کنید';
  }

  // Choose color based on status
  let dotColor = theme.palette.grey[400];
  if (isRunning)        dotColor = theme.palette.info.main;
  else if (errorMsg)    dotColor = theme.palette.error.main;
  else if (isFailed)    dotColor = theme.palette.warning.main;
  else if (isCompleted) dotColor = theme.palette.success.main;
  else if (!latestRun)  dotColor = theme.palette.warning.main;

  return (
    <Tooltip title={tooltip} arrow>
      <span>
        <IconButton
          onClick={handleClick}
          disabled={isRunning}
          size="small"
          sx={{
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 4,
              right: 4,
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: dotColor,
              border: `2px solid ${theme.palette.background.paper}`,
              transition: 'background-color 0.3s',
            },
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.08),
            },
          }}
        >
          <Iconify
            icon="solar:refresh-bold-duotone"
            width={22}
            sx={{
              color: 'text.secondary',
              ...(isRunning && {
                animation: 'spin 1s linear infinite',
                '@keyframes spin': {
                  from: { transform: 'rotate(0deg)' },
                  to: { transform: 'rotate(360deg)' },
                },
              }),
            }}
          />
        </IconButton>
      </span>
    </Tooltip>
  );
}
