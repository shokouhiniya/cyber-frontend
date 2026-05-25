'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import { alpha, useTheme } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';

import axios, { endpoints } from 'src/lib/axios';
import { useAdminProfiles, useDeleteProfile, useArchiveProfile } from 'src/api/admin';

import { Iconify } from 'src/components/iconify';

import { AdminPageHeader } from '../shared/page-header';
import { ProfileFormDialog } from './profile-form-dialog';

// ----------------------------------------------------------------------

const SORT_OPTIONS = [
  { value: 'name_asc',     label: 'نام (الف تا ی)' },
  { value: 'name_desc',    label: 'نام (ی تا الف)' },
  { value: 'posts_desc',   label: 'بیشترین پست' },
  { value: 'keywords_desc',label: 'بیشترین کلیدواژه' },
  { value: 'users_desc',   label: 'بیشترین کاربر' },
  { value: 'active_first', label: 'فعال‌ها اول' },
];

function sortProfiles(profiles, sortKey) {
  const arr = [...profiles];
  const getSortKey = (p) => p.sortName || (p.name || '').split(/\s+/).pop() || '';
  switch (sortKey) {
    case 'name_asc':      return arr.sort((a, b) => getSortKey(a).localeCompare(getSortKey(b), 'fa'));
    case 'name_desc':     return arr.sort((a, b) => getSortKey(b).localeCompare(getSortKey(a), 'fa'));
    case 'posts_desc':    return arr.sort((a, b) => (b.postCount ?? 0) - (a.postCount ?? 0));
    case 'keywords_desc': return arr.sort((a, b) => (b.keywords?.length ?? 0) - (a.keywords?.length ?? 0));
    case 'users_desc':    return arr.sort((a, b) => (b.userCount ?? 0) - (a.userCount ?? 0));
    case 'active_first':  return arr.sort((a, b) => (b.isActive ? 1 : 0) - (a.isActive ? 1 : 0));
    default:              return arr;
  }
}

// ── Per-profile ingest status chip ───────────────────────────────────────────

function IngestStatusChip({ runState }) {
  if (!runState) return null;

  if (runState.status === 'running') {
    return (
      <Chip
        size="small"
        icon={<Iconify icon="solar:refresh-bold" width={10} sx={{ animation: 'spin 1s linear infinite', '@keyframes spin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } } }} />}
        label="در حال جمع‌آوری..."
        sx={{ height: 18, fontSize: 9, bgcolor: 'info.lighter', color: 'info.dark' }}
      />
    );
  }
  if (runState.status === 'completed') {
    return (
      <Tooltip title={`${runState.postsSelected?.toLocaleString('fa-IR') ?? 0} پست انتخاب شد`}>
        <Chip
          size="small"
          icon={<Iconify icon="solar:check-circle-bold" width={10} />}
          label={`${runState.postsSelected ?? 0} پست`}
          sx={{ height: 18, fontSize: 9, bgcolor: 'success.lighter', color: 'success.dark' }}
        />
      </Tooltip>
    );
  }
  if (runState.status === 'failed') {
    return (
      <Tooltip title={runState.errorMessage || 'خطا در جمع‌آوری'}>
        <Chip
          size="small"
          icon={<Iconify icon="solar:danger-triangle-bold" width={10} />}
          label="خطا"
          sx={{ height: 18, fontSize: 9, bgcolor: 'error.lighter', color: 'error.dark' }}
        />
      </Tooltip>
    );
  }
  return null;
}

// ── Profile card with per-profile ingest state ────────────────────────────────

function ProfileCard({ p, onEdit, onArchive, onDelete }) {
  const theme = useTheme();
  const [runState, setRunState] = useState(null);   // null | { status, postsSelected, errorMessage }
  const [polling, setPolling] = useState(false);

  // Poll the latest run every 3s while running
  useEffect(() => {
    if (!polling) return undefined;
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(endpoints.admin.ingestLatestRun(p.id));
        const run = res.data;
        if (run) {
          setRunState({ status: run.status, postsSelected: run.postsSelected, errorMessage: run.errorMessage });
          if (run.status !== 'running') {
            setPolling(false);
          }
        }
      } catch {
        setPolling(false);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [polling, p.id]);

  const handleRunNow = useCallback(async () => {
    setRunState({ status: 'running', postsSelected: 0, errorMessage: null });
    setPolling(true);
    try {
      await axios.post(endpoints.admin.ingestRunNow(p.id));
    } catch (e) {
      setRunState({ status: 'failed', postsSelected: 0, errorMessage: e?.message || 'خطا' });
      setPolling(false);
    }
  }, [p.id]);

  const isRunning = runState?.status === 'running';

  return (
    <Card key={p.id} sx={{ overflow: 'hidden', opacity: p.isActive ? 1 : 0.6 }}>
      {/* Progress bar — only visible while running */}
      {isRunning && (
        <LinearProgress
          sx={{ height: 2, borderRadius: 0 }}
          color="info"
        />
      )}

      <Box sx={{ p: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          {/* Avatar */}
          <Avatar
            src={p.avatar}
            sx={{
              width: 48, height: 48, flexShrink: 0,
              bgcolor: p.primaryColor || 'primary.main',
              fontSize: 18, fontWeight: 700,
            }}
          >
            {p.name?.charAt(0)}
          </Avatar>

          {/* Main info */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ flexWrap: 'wrap' }}>
              <Typography variant="subtitle1" fontWeight={700} noWrap>
                {p.name}
              </Typography>
              {!p.isActive && <Chip label="غیرفعال" size="small" color="default" />}
              {p.tier && (
                <Chip
                  label={p.tier === 'heavy' ? 'سنگین' : p.tier === 'light' ? 'سبک' : 'متوسط'}
                  size="small"
                  sx={{
                    height: 18, fontSize: 9, fontWeight: 700,
                    bgcolor: p.tier === 'heavy' ? 'error.lighter' : p.tier === 'light' ? 'success.lighter' : 'warning.lighter',
                    color: p.tier === 'heavy' ? 'error.dark' : p.tier === 'light' ? 'success.dark' : 'warning.dark',
                  }}
                />
              )}
              <IngestStatusChip runState={runState} />
            </Stack>

            <Typography variant="body2" color="text.secondary" noWrap sx={{ fontSize: 12 }}>
              {[p.role, p.organization].filter(Boolean).join(' — ')}
            </Typography>

            {/* Compact stats row */}
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 0.75 }}>
              <Stack direction="row" alignItems="center" spacing={0.5} title="تعداد پست">
                <Iconify icon="solar:document-text-bold" width={13} sx={{ color: 'text.disabled' }} />
                <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
                  {(p.postCount ?? 0).toLocaleString('fa-IR')}
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={0.5} title="تعداد کاربر">
                <Iconify icon="solar:user-bold" width={13} sx={{ color: 'text.disabled' }} />
                <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
                  {p.userCount ?? 0}
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={0.5} title="منابع داده">
                <Iconify icon="solar:database-bold" width={13} sx={{ color: 'text.disabled' }} />
                <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
                  {p.sourceCount ?? 0}
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={0.5} title="کلیدواژه‌های جستجو">
                <Iconify icon="solar:magnifer-bold" width={13} sx={{ color: 'text.disabled' }} />
                <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
                  {p.keywords?.length ?? 0}
                </Typography>
              </Stack>
              {p.primaryColor && (
                <Box
                  sx={{
                    width: 12, height: 12, borderRadius: '50%',
                    bgcolor: p.primaryColor,
                    border: `1px solid ${alpha(p.primaryColor, 0.4)}`,
                    flexShrink: 0,
                  }}
                  title={p.primaryColor}
                />
              )}
            </Stack>

            {/* Fetch schedule row */}
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 0.5 }}>
              {p.lastFetchAt ? (
                <Stack direction="row" alignItems="center" spacing={0.5} title="آخرین جمع‌آوری">
                  <Iconify icon="solar:history-bold" width={12} sx={{ color: 'text.disabled' }} />
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9 }}>
                    {new Date(p.lastFetchAt).toLocaleString('fa-IR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tehran' })}
                    {p.lastFetchPosts != null && ` · ${p.lastFetchPosts} پست`}
                  </Typography>
                </Stack>
              ) : (
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Iconify icon="solar:history-bold" width={12} sx={{ color: 'text.disabled' }} />
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9 }}>هنوز جمع‌آوری نشده</Typography>
                </Stack>
              )}
              {p.nextFetchAt && (
                <Stack direction="row" alignItems="center" spacing={0.5} title="جمع‌آوری بعدی">
                  <Iconify icon="solar:calendar-bold" width={12} sx={{ color: 'info.main' }} />
                  <Typography variant="caption" sx={{ fontSize: 9, color: 'info.main' }}>
                    {new Date(p.nextFetchAt).toLocaleString('fa-IR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tehran' })}
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Box>

          {/* Actions */}
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexShrink: 0 }}>
            <IconButton size="small" onClick={() => onEdit(p)} title="ویرایش">
              <Iconify icon="solar:pen-bold" width={18} />
            </IconButton>
            <Tooltip title={isRunning ? 'در حال جمع‌آوری...' : 'جمع‌آوری داده (Run Now)'}>
              <span>
                <IconButton
                  size="small"
                  disabled={isRunning}
                  onClick={handleRunNow}
                  sx={{ color: isRunning ? 'text.disabled' : 'primary.main' }}
                >
                  <Iconify
                    icon="solar:refresh-bold"
                    width={18}
                    sx={isRunning ? { animation: 'spin 1s linear infinite', '@keyframes spin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } } } : {}}
                  />
                </IconButton>
              </span>
            </Tooltip>
            <IconButton
              size="small"
              onClick={() => onArchive(p)}
              title="غیرفعال‌سازی"
              disabled={!p.isActive}
            >
              <Iconify icon="solar:archive-bold" width={18} />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => onDelete(p)}
              title="حذف دائمی"
            >
              <Iconify icon="solar:trash-bin-2-bold" width={18} />
            </IconButton>
          </Stack>
        </Stack>
      </Box>
    </Card>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

export function AdminProfilesView() {
  const { data: profiles = [], isLoading } = useAdminProfiles();
  const archive = useArchiveProfile();
  const deleteProfile = useDeleteProfile();

  const [editing, setEditing] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sortKey, setSortKey] = useState('name_asc');

  const sorted = useMemo(() => sortProfiles(profiles, sortKey), [profiles, sortKey]);

  const openNew = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (p) => { setEditing(p); setDialogOpen(true); };

  const handleArchive = (p) => {
    if (window.confirm(`پروفایل «${p.name}» غیرفعال شود؟`)) archive.mutate(p.id);
  };
  const handleDelete = (p) => {
    if (window.confirm(`پروفایل «${p.name}» برای همیشه حذف شود؟\n\nاین عمل قابل بازگشت نیست.`)) deleteProfile.mutate(p.id);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <AdminPageHeader
        title="مدیریت پروفایل‌ها"
        subtitle="هر پروفایل نماینده یک کلاینت / تحلیل‌شونده در سیستم است."
        action={
          <Button variant="contained" startIcon={<Iconify icon="eva:plus-fill" />} onClick={openNew}>
            پروفایل جدید
          </Button>
        }
      />

      {/* Sort bar */}
      {!isLoading && profiles.length > 1 && (
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
            مرتب‌سازی:
          </Typography>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <Select value={sortKey} onChange={(e) => setSortKey(e.target.value)} displayEmpty>
              {SORT_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="caption" color="text.disabled">
            {profiles.length} پروفایل
          </Typography>
        </Stack>
      )}

      {isLoading ? (
        <Card sx={{ p: 3 }}>در حال بارگذاری...</Card>
      ) : profiles.length === 0 ? (
        <Card sx={{ p: 3 }}>هنوز پروفایلی ایجاد نشده است.</Card>
      ) : (
        <Stack spacing={1.5}>
          {sorted.map((p) => (
            <ProfileCard
              key={p.id}
              p={p}
              onEdit={openEdit}
              onArchive={handleArchive}
              onDelete={handleDelete}
            />
          ))}
        </Stack>
      )}

      <ProfileFormDialog
        open={dialogOpen}
        profile={editing}
        onClose={() => setDialogOpen(false)}
      />
    </Container>
  );
}
