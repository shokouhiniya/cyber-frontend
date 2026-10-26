'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Popover from '@mui/material/Popover';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import { fNum, fPercent } from 'src/utils/format-number-fa';

import axios from 'src/lib/axios';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

const POLL_MS = 3000;
// Consecutive failed polls before we stop and tell the user (≈ 30 s)
const MAX_POLL_ERRORS = 10;
const PILL_DURATION_MS = 4000;

// Pipeline steps reported by GET /api/ingest/latest-run (`stage`), in order
const STAGES = [
  { key: 'fetch', label: 'دریافت پست‌ها از منابع' },
  { key: 'dedup', label: 'حذف موارد تکراری' },
  { key: 'store', label: 'ذخیره پست‌ها' },
  { key: 'totals', label: 'آمار کل پلتفرم‌ها' },
  { key: 'feeds', label: 'فیدهای نمایشی و صفحات رسمی' },
  { key: 'sentiment', label: 'تحلیل احساسات' },
  { key: 'ai', label: 'تولید تحلیل‌های هوش مصنوعی' },
];
const STAGE_LABEL = Object.fromEntries(STAGES.map((s) => [s.key, s.label]));
STAGE_LABEL.queued = 'در صف اجرا';
STAGE_LABEL.done = 'پایان';

const SPIN_SX = {
  animation: 'spin 1s linear infinite',
  '@keyframes spin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
};

const errorText = (e, fallback) => (typeof e === 'string' ? e : e?.message) || fallback;

const toRunState = (run) => ({
  id: run.id,
  status: run.status,
  stage: run.stage || 'queued',
  progress: Math.max(0, Math.min(100, run.progress ?? 0)),
  postsSelected: run.postsSelected ?? 0,
  errorMessage: run.errorMessage || null,
});

// ----------------------------------------------------------------------

export function IngestRefreshButton() {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();

  // runState: null | { id, status, stage, progress, postsSelected, errorMessage }
  const [runState, setRunState] = useState(null);
  const [showPill, setShowPill] = useState(false);
  const [cooldownSec, setCooldownSec] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);

  const pollRef = useRef(null);
  const pollErrorsRef = useRef(0);
  const cooldownRef = useRef(null);
  const pillTimerRef = useRef(null);

  const canRun = user?.role === 'super_admin' || user?.role === 'client_admin';

  const stopPolling = useCallback(() => {
    if (pollRef.current) clearTimeout(pollRef.current);
    pollRef.current = null;
  }, []);

  // ── Cleanup on unmount ────────────────────────────────────────────────
  useEffect(() => () => {
    stopPolling();
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    if (pillTimerRef.current) clearTimeout(pillTimerRef.current);
  }, [stopPolling]);

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

  const finishRun = useCallback((run) => {
    setAnchorEl(null);
    if (run.status === 'failed') {
      toast.error(run.errorMessage || 'جمع‌آوری داده‌ها با خطا متوقف شد');
      return;
    }
    toast.success(`جمع‌آوری تمام شد — ${fNum(run.postsSelected ?? 0)} پست انتخاب شد`);
    queryClient.invalidateQueries();
    setShowPill(true);
    if (pillTimerRef.current) clearTimeout(pillTimerRef.current);
    pillTimerRef.current = setTimeout(() => {
      setShowPill(false);
      setRunState(null);
    }, PILL_DURATION_MS);
  }, [queryClient]);

  // ── Poll latest-run until our run (runId) leaves 'running' ────────────
  // Transient errors (proxy hiccup, backend restart) are retried up to
  // MAX_POLL_ERRORS times in a row before we give up instead of spinning.
  const startPolling = useCallback((runId) => {
    stopPolling();
    pollErrorsRef.current = 0;

    const tick = async () => {
      try {
        const res = await axios.get('/api/ingest/latest-run');
        pollErrorsRef.current = 0;
        const run = res.data;
        // Not our run yet (or none) — keep waiting
        if (run && (!runId || run.id === runId)) {
          setRunState(toRunState(run));
          if (run.status !== 'running') {
            stopPolling();
            finishRun(run);
            return;
          }
        }
      } catch (e) {
        pollErrorsRef.current += 1;
        if (pollErrorsRef.current >= MAX_POLL_ERRORS) {
          stopPolling();
          setRunState(null);
          setAnchorEl(null);
          toast.warning(`وضعیت جمع‌آوری در دسترس نیست (${errorText(e, 'خطای ارتباط')}). جمع‌آوری ممکن است همچنان در سرور ادامه داشته باشد؛ کمی بعد صفحه را تازه کنید.`);
          return;
        }
      }
      pollRef.current = setTimeout(tick, POLL_MS);
    };

    pollRef.current = setTimeout(tick, POLL_MS);
  }, [stopPolling, finishRun]);

  // ── Resume tracking a run that is already in flight (e.g. after reload) ─
  useEffect(() => {
    if (!canRun) return undefined;
    let cancelled = false;
    axios.get('/api/ingest/latest-run')
      .then((res) => {
        const run = res.data;
        if (cancelled || !run || run.status !== 'running') return;
        setRunState(toRunState(run));
        startPolling(run.id);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [canRun, startPolling]);

  // ── Click ─────────────────────────────────────────────────────────────
  const handleClick = useCallback(async (event) => {
    if (!canRun || runState?.status === 'running' || cooldownSec > 0) return;
    const anchor = event.currentTarget;

    setRunState({ id: null, status: 'running', stage: 'queued', progress: 0, postsSelected: 0, errorMessage: null });
    setShowPill(false);

    try {
      // Returns { runId } immediately; the pipeline runs in the background
      const res = await axios.post('/api/ingest/run-now');
      const runId = res.data?.runId ?? null;
      setRunState((s) => ({ ...s, id: runId }));
      setAnchorEl(anchor);
      toast.info('جمع‌آوری داده‌ها شروع شد. پیشرفت را می‌توانید دنبال کنید.');
      startPolling(runId);
    } catch (e) {
      // The axios interceptor rejects with the server's message as a plain string
      const msg = errorText(e, '');
      const minMatch = msg.match(/([\d۰-۹]+)\s*دقیقه/);
      if (minMatch) {
        const minutes = parseInt(minMatch[1].replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)), 10);
        startCooldown(minutes * 60);
        setRunState(null);
        toast.warning(msg);
        return;
      }
      if (msg.includes('در جریان')) {
        // Someone else already started a run — follow it
        toast.info(msg);
        startPolling(null);
        return;
      }
      const errorMessage = msg || 'خطا در شروع جمع‌آوری داده‌ها';
      setRunState({ id: null, status: 'failed', stage: null, progress: 0, postsSelected: 0, errorMessage });
      toast.error(errorMessage);
    }
  }, [canRun, runState, cooldownSec, startPolling, startCooldown]);

  if (!user || !canRun) return null;

  const isRunning  = runState?.status === 'running';
  const isFailed   = runState?.status === 'failed';
  const inCooldown = cooldownSec > 0;
  const disabled   = isRunning || inCooldown;
  const stageLabel = STAGE_LABEL[runState?.stage] || 'در حال جمع‌آوری';

  // ── Tooltip ───────────────────────────────────────────────────────────
  let tooltip = 'جمع‌آوری داده‌ها';
  if (isRunning) {
    tooltip = `${stageLabel} — ${fPercent(runState.progress)}`;
  } else if (inCooldown) {
    const m = Math.floor(cooldownSec / 60);
    const s = cooldownSec % 60;
    tooltip = `در دسترس نیست — ${m > 0 ? `${fNum(m)} دقیقه` : ''} ${s > 0 ? `${fNum(s)} ثانیه` : ''}`.trim();
  } else if (isFailed) {
    tooltip = runState.errorMessage || 'خطا — کلیک کنید تا دوباره امتحان شود';
  }

  const currentIdx = STAGES.findIndex((s) => s.key === runState?.stage);

  return (
    <Stack direction="row" alignItems="center" spacing={0.5}>
      {/* Running chip — click for step-by-step progress */}
      {isRunning && (
        <Chip
          size="small"
          clickable
          onClick={(e) => setAnchorEl(e.currentTarget)}
          icon={<Iconify icon="solar:refresh-bold" width={10} sx={SPIN_SX} />}
          label={`${stageLabel} · ${fPercent(runState.progress)}`}
          sx={{ height: 20, fontSize: 10, bgcolor: 'info.lighter', color: 'info.dark', maxWidth: 220 }}
        />
      )}

      {/* Completed pill — shown for PILL_DURATION_MS */}
      {showPill && runState?.status === 'completed' && (
        <Tooltip title={`${fNum(runState.postsSelected)} پست انتخاب شد`}>
          <Chip
            size="small"
            icon={<Iconify icon="solar:check-circle-bold" width={10} />}
            label={`${fNum(runState.postsSelected)} پست`}
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
            sx={{ color: disabled ? 'text.disabled' : 'primary.main' }}
          >
            <Iconify icon="solar:refresh-bold" width={18} sx={isRunning ? SPIN_SX : {}} />
          </IconButton>
        </span>
      </Tooltip>

      <Popover
        open={Boolean(anchorEl) && isRunning}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        slotProps={{ paper: { sx: { p: 2, width: 280 } } }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 1 }}>
          <Typography variant="subtitle2">جمع‌آوری داده‌ها</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {fPercent(runState?.progress ?? 0)}
          </Typography>
        </Stack>
        <LinearProgress
          variant={runState?.stage === 'queued' ? 'indeterminate' : 'determinate'}
          value={runState?.progress ?? 0}
          sx={{ height: 6, borderRadius: 3, mb: 1.5 }}
        />
        <Stack spacing={0.75}>
          {STAGES.map((s, i) => {
            const done = currentIdx > i;
            const active = currentIdx === i;
            return (
              <Stack key={s.key} direction="row" alignItems="center" spacing={1}>
                <Box sx={{ display: 'flex', color: done ? 'success.main' : active ? 'info.main' : 'text.disabled' }}>
                  <Iconify
                    width={14}
                    icon={done ? 'solar:check-circle-bold' : active ? 'solar:refresh-bold' : 'solar:clock-circle-linear'}
                    sx={active ? SPIN_SX : undefined}
                  />
                </Box>
                <Typography
                  variant="caption"
                  sx={{ color: active ? 'text.primary' : 'text.secondary', fontWeight: active ? 600 : 400 }}
                >
                  {s.label}
                </Typography>
              </Stack>
            );
          })}
        </Stack>
        <Typography variant="caption" component="p" sx={{ color: 'text.disabled', mt: 1.5 }}>
          می‌توانید این پنجره را ببندید؛ جمع‌آوری در پس‌زمینه ادامه دارد.
        </Typography>
      </Popover>
    </Stack>
  );
}
