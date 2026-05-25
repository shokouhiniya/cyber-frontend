'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRef, useState, useEffect, useCallback } from 'react';

import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';

import axios from 'src/lib/axios';

import { Iconify } from 'src/components/iconify';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

const PILL_DURATION_MS = 3000;

export function IngestRefreshButton() {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();

  // runState: null | { status, postsSelected, errorMessage }
  const [runState, setRunState] = useState(null);
  const [showPill, setShowPill] = useState(false);
  const [cooldownSec, setCooldownSec] = useState(0);

  const pollRef = useRef(null);
  const cooldownRef = useRef(null);
  const pillTimerRef = useRef(null);

  const canRun = user?.role === 'super_admin' || user?.role === 'client_admin';

  // ── Cleanup on unmount ────────────────────────────────────────────────
  useEffect(() => () => {
    if (pollRef.current)    clearInterval(pollRef.current);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    if (pillTimerRef.current) clearTimeout(pillTimerRef.current);
  }, []);

  // ── Cooldown countdown ────────────────────────────────────────────────
  const startCooldown = useCallback((seconds) => {
    setCooldownSec(seconds);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setCooldownSec((s) => {
        if (s <= 1) { clearInterval(cooldownRef.current); return 0; }
        return s - 1;
      });
    }, 1000);
  }, []);

  // ── Start polling for the run we just triggered ───────────────────────
  const startPolling = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);

    pollRef.current = setInterval(async () => {
      try {
        const res = await axios.get('/api/ingest/latest-run');
        const run = res.data;
        if (!run) return;

        setRunState({
          status: run.status,
          postsSelected: run.postsSelected ?? 0,
          errorMessage: run.errorMessage || null,
        });

        if (run.status !== 'running') {
          clearInterval(pollRef.current);

          if (run.status === 'completed') {
            queryClient.invalidateQueries();
            setShowPill(true);
            if (pillTimerRef.current) clearTimeout(pillTimerRef.current);
            pillTimerRef.current = setTimeout(() => {
              setShowPill(false);
              setRunState(null);
            }, PILL_DURATION_MS);
          }
        }
      } catch {
        clearInterval(pollRef.current);
      }
    }, 3000);
  }, [queryClient]);

  // ── Click ─────────────────────────────────────────────────────────────
  const handleClick = useCallback(async () => {
    if (!canRun || runState?.status === 'running' || cooldownSec > 0) return;

    // Optimistically show running state immediately
    setRunState({ status: 'running', postsSelected: 0, errorMessage: null });
    setShowPill(false);

    try {
      await axios.post('/api/ingest/run-now');
      // POST succeeded — start polling for the actual run record
      startPolling();
    } catch (e) {
      const msg = e?.response?.data?.message || '';
      const minMatch = msg.match(/(\d+)\s*دقیقه/);
      if (minMatch) {
        startCooldown(parseInt(minMatch[1], 10) * 60);
        setRunState(null);
      } else {
        setRunState({ status: 'failed', postsSelected: 0, errorMessage: msg || 'خطا در جمع‌آوری' });
      }
    }
  }, [canRun, runState, cooldownSec, startPolling, startCooldown]);

  if (!user || !canRun) return null;

  const isRunning  = runState?.status === 'running';
  const isFailed   = runState?.status === 'failed';
  const inCooldown = cooldownSec > 0;
  const disabled   = isRunning || inCooldown;

  // ── Tooltip ───────────────────────────────────────────────────────────
  let tooltip = 'جمع‌آوری داده‌ها';
  if (isRunning) {
    tooltip = 'در حال جمع‌آوری...';
  } else if (inCooldown) {
    const m = Math.floor(cooldownSec / 60);
    const s = cooldownSec % 60;
    tooltip = `در دسترس نیست — ${m > 0 ? `${m} دقیقه` : ''} ${s > 0 ? `${s} ثانیه` : ''}`.trim();
  } else if (isFailed) {
    tooltip = runState.errorMessage || 'خطا — کلیک کنید تا دوباره امتحان شود';
  }

  const iconColor = disabled ? 'text.disabled' : 'primary.main';

  return (
    <Stack direction="row" alignItems="center" spacing={0.5}>
      {/* Running pill */}
      {isRunning && (
        <Chip
          size="small"
          icon={
            <Iconify
              icon="solar:refresh-bold"
              width={10}
              sx={{
                animation: 'spin 1s linear infinite',
                '@keyframes spin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
              }}
            />
          }
          label="در حال جمع‌آوری..."
          sx={{ height: 18, fontSize: 9, bgcolor: 'info.lighter', color: 'info.dark' }}
        />
      )}

      {/* Completed pill — shown for PILL_DURATION_MS */}
      {showPill && runState?.status === 'completed' && (
        <Tooltip title={`${runState.postsSelected?.toLocaleString('fa-IR') ?? 0} پست انتخاب شد`}>
          <Chip
            size="small"
            icon={<Iconify icon="solar:check-circle-bold" width={10} />}
            label={`${runState.postsSelected ?? 0} پست`}
            sx={{ height: 18, fontSize: 9, bgcolor: 'success.lighter', color: 'success.dark' }}
          />
        </Tooltip>
      )}

      {/* Failed pill */}
      {isFailed && (
        <Tooltip title={runState.errorMessage || 'خطا در جمع‌آوری'}>
          <Chip
            size="small"
            icon={<Iconify icon="solar:danger-triangle-bold" width={10} />}
            label="خطا"
            sx={{ height: 18, fontSize: 9, bgcolor: 'error.lighter', color: 'error.dark' }}
          />
        </Tooltip>
      )}

      {/* The button */}
      <Tooltip title={tooltip} arrow>
        <span>
          <IconButton
            size="small"
            disabled={disabled}
            onClick={handleClick}
            sx={{ color: iconColor }}
          >
            <Iconify
              icon="solar:refresh-bold"
              width={18}
              sx={isRunning ? {
                animation: 'spin 1s linear infinite',
                '@keyframes spin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
              } : {}}
            />
          </IconButton>
        </span>
      </Tooltip>
    </Stack>
  );
}
