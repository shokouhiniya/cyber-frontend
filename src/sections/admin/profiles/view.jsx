'use client';

import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import Slider from '@mui/material/Slider';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import ListItem from '@mui/material/ListItem';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Container from '@mui/material/Container';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import ToggleButton from '@mui/material/ToggleButton';
import { alpha, useTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import ListItemButton from '@mui/material/ListItemButton';
import TableContainer from '@mui/material/TableContainer';
import LinearProgress from '@mui/material/LinearProgress';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { fNum, toFaDigits } from 'src/utils/format-number-fa';

import { CONFIG } from 'src/global-config';
import axios, { endpoints } from 'src/lib/axios';
import { useAdminDesktopMode } from 'src/contexts/admin-desktop-mode';
import { useProfileUsage , useAdminProfiles, useDeleteProfile, useArchiveProfile } from 'src/api/admin';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { JWT_STORAGE_KEY } from 'src/auth/context/jwt/constant';

import { AdminPageHeader } from '../shared/page-header';
import { ProfileFormDialog } from './profile-form-dialog';
import { BatchImportDialog } from './batch-import-dialog';
import { getErrorText, adminTableSx, AdminListState, AdminTableCard, RowActionsMenu } from '../shared/admin-ui';

/** Short Tehran-time timestamp, Persian digits. */
const fDateTime = (dt) =>
  dt
    ? new Date(dt).toLocaleString('fa-IR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tehran' })
    : '—';

// ----------------------------------------------------------------------

const SORT_OPTIONS = [
  { value: 'name_asc',     label: 'نام (الف تا ی)' },
  { value: 'name_desc',    label: 'نام (ی تا الف)' },
  { value: 'posts_desc',   label: 'بیشترین پست' },
  { value: 'keywords_desc',label: 'بیشترین کلیدواژه' },
  { value: 'users_desc',   label: 'بیشترین کاربر' },
  { value: 'active_first', label: 'فعال‌ها اول' },
];

const TIER_LABELS = { heavy: 'سنگین', medium: 'متوسط', light: 'سبک' };
const TIER_COLORS = { heavy: 'error', medium: 'warning', light: 'success' };

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

function filterProfiles(profiles, { search, tier, status, hasAi }) {
  return profiles.filter((p) => {
    if (search) {
      const q = search.toLowerCase();
      const match = (p.name || '').toLowerCase().includes(q)
        || (p.role || '').toLowerCase().includes(q)
        || (p.organization || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    if (tier && p.tier !== tier) return false;
    if (status === 'active' && !p.isActive) return false;
    if (status === 'inactive' && p.isActive) return false;
    if (hasAi === 'yes' && !p.lastAiAt) return false;
    if (hasAi === 'no' && p.lastAiAt) return false;
    return true;
  });
}

// ── Sparkline bar chart (pure CSS, no library) ───────────────────────────────

function Sparkline({ data, color = '#1976d2', height = 32 }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const days = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']; // Sat–Fri labels
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height }}>
      {data.map((d, i) => {
        const pct = (d.count / max) * 100;
        const isToday = i === data.length - 1;
        return (
          <Box key={d.day} title={`${toFaDigits(d.day)}: ${fNum(d.count)}`}
            sx={{
              flex: 1, borderRadius: '2px 2px 0 0',
              minHeight: d.count > 0 ? 3 : 1,
              height: `${Math.max(pct, d.count > 0 ? 8 : 2)}%`,
              bgcolor: d.count > 0 ? (isToday ? color : `${color}99`) : 'divider',
              transition: 'height 0.2s',
              cursor: 'default',
            }}
          />
        );
      })}
    </Box>
  );
}

// ── Profile usage dialog ──────────────────────────────────────────────────────

function ProfileUsageDialog({ profileId, profileName, open, onClose }) {
  const theme = useTheme();
  const { data: rows = [], isLoading } = useProfileUsage(open ? profileId : null);

  const fmt = fDateTime;

  // Summary stats
  const totalEvents = rows.reduce((s, r) => s + r.totalEvents, 0);
  const activeThisWeek = rows.filter((r) => r.daily7?.some((d) => d.count > 0)).length;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="solar:chart-bold" width={20} sx={{ color: 'primary.main' }} />
          <span>آمار استفاده — {profileName}</span>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ pb: 2 }}>
        {isLoading ? (
          <LinearProgress sx={{ mt: 1 }} />
        ) : rows.length === 0 ? (
          <Stack alignItems="center" spacing={1.5} sx={{ py: 4 }}>
            <Iconify icon="solar:chart-bold" width={40} sx={{ color: 'text.disabled' }} />
            <Typography variant="body2" color="text.secondary">هنوز رویداد استفاده‌ای ثبت نشده است.</Typography>
          </Stack>
        ) : (
          <>
            {/* Summary header */}
            <Stack direction="row" spacing={2} sx={{ mb: 2, p: 1.5, borderRadius: 1.5, bgcolor: 'background.neutral' }}>
              <Stack alignItems="center" sx={{ flex: 1 }}>
                <Typography variant="h5" fontWeight={800} color="primary.main">{fNum(totalEvents)}</Typography>
                <Typography variant="caption" color="text.secondary">کل رویداد</Typography>
              </Stack>
              <Stack alignItems="center" sx={{ flex: 1 }}>
                <Typography variant="h5" fontWeight={800} color="success.main">{fNum(rows.length)}</Typography>
                <Typography variant="caption" color="text.secondary">کاربر</Typography>
              </Stack>
              <Stack alignItems="center" sx={{ flex: 1 }}>
                <Typography variant="h5" fontWeight={800} color="warning.main">{fNum(activeThisWeek)}</Typography>
                <Typography variant="caption" color="text.secondary">فعال این هفته</Typography>
              </Stack>
            </Stack>

            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table size="small" sx={[adminTableSx, { minWidth: 560 }]}>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'background.neutral' }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: 12, py: 1.25 }}>کاربر</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: 12, py: 1.25 }} align="center">کل</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: 12, py: 1.25, minWidth: 100 }}>۷ روز اخیر</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: 12, py: 1.25 }}>آخرین بازدید</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: 12, py: 1.25 }}>پرکاربردترین بخش‌ها</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((r) => {
                    const weekTotal = (r.daily7 || []).reduce((s, d) => s + d.count, 0);
                    return (
                      <TableRow key={r.userId} hover sx={{ '&:last-child td': { border: 0 } }}>
                        <TableCell sx={{ py: 1 }}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Avatar sx={{ width: 28, height: 28, fontSize: 11, fontWeight: 700, bgcolor: 'primary.lighter', color: 'primary.dark' }}>
                              {r.name?.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="caption" fontWeight={700} sx={{ fontSize: 12, display: 'block' }}>{r.name}</Typography>
                              {r.username && <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12 }}>@{r.username}</Typography>}
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell align="center" sx={{ py: 1 }}>
                          <Chip size="small" label={fNum(r.totalEvents)} color="primary" variant="outlined" sx={{ fontSize: 12, fontWeight: 700 }} />
                        </TableCell>
                        <TableCell sx={{ py: 1 }}>
                          <Stack spacing={0.5}>
                            <Sparkline data={r.daily7 || []} color={theme.palette.primary.main} height={28} />
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12, textAlign: 'center' }}>
                              {weekTotal > 0 ? `${fNum(weekTotal)} رویداد` : 'غیرفعال'}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ py: 1 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12, whiteSpace: 'nowrap' }}>{fmt(r.lastSeen)}</Typography>
                        </TableCell>
                        <TableCell sx={{ py: 1 }}>
                          <Stack direction="row" flexWrap="wrap" gap={0.5}>
                            {(r.topFeatures || []).slice(0, 3).map((f) => (
                              <Chip key={f.eventName} size="small"
                                label={`${f.eventName.replace(/^(dashboard|admin)\./, '').replace(/\.$/, '')} (${fNum(f.count)})`}
                                color="info" variant="soft" sx={{ fontSize: 12 }} />
                            ))}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Ingest action dialog ──────────────────────────────────────────────────────

const INGEST_OPTIONS = [
  {
    key: 'full',
    endpoint: (id) => endpoints.admin.ingestRunNow(id),
    icon: 'solar:refresh-bold',
    color: 'success.main',
    title: 'جمع‌آوری کامل',
    desc: 'دریافت پست‌های جدید + بازتولید تحلیل هوش مصنوعی',
    pollable: true,
    doneMsg: (n) => `${fNum(n)} پست جمع‌آوری و تحلیل شد`,
  },
  {
    key: 'posts_only',
    endpoint: () => '/api/ingest/posts-only',
    icon: 'solar:cloud-download-bold-duotone',
    color: 'info.main',
    title: 'فقط جمع‌آوری پست‌ها',
    desc: 'دریافت پست‌های جدید بدون اجرای پرامپت‌های هوش مصنوعی',
    pollable: true,
    doneMsg: (n) => `${fNum(n)} پست جمع‌آوری شد`,
  },
  {
    key: 'ai_only',
    endpoint: () => '/api/ai-content/regenerate-all',
    icon: 'solar:cpu-bolt-bold',
    color: 'secondary.main',
    title: 'بازتولید تحلیل هوش مصنوعی',
    desc: 'اجرای مجدد پرامپت‌ها روی پست‌های موجود — بدون دریافت پست جدید',
    pollable: false,
    synchronous: true, // endpoint runs all prompts and returns when done
    doneMsg: (n, res) => {
      if (res?.errorCount > 0) return `تحلیل با ${fNum(res.errorCount)} خطا تکمیل شد (${res.durationMs ? fNum(Math.round(res.durationMs / 1000)) : '?'} ثانیه)`;
      return `تحلیل هوش مصنوعی بازتولید شد (${res?.durationMs ? fNum(Math.round(res.durationMs / 1000)) : '?'} ثانیه) — داشبورد به‌روز می‌شود`;
    },
  },
];

function IngestActionDialog({ profileId, profileName, open, onClose, onStart }) {
  const [phase, setPhase] = useState('select'); // 'select' | 'customize' | 'running' | 'done' | 'error'
  const [activeOpt, setActiveOpt] = useState(null);
  const [doneMsg, setDoneMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const pollRef = useRef(null);

  // AI customization state
  const [availableSources, setAvailableSources] = useState([]);
  const [selectedSources, setSelectedSources] = useState([]);
  const [sampleLimit, setSampleLimit] = useState(80);
  const [sortBy, setSortBy] = useState('engagement');

  const SOURCE_LABELS = {
    telegram: 'تلگرام', news: 'خبرگزاری', twitter: 'ایکس', instagram: 'اینستاگرام',
    newspaper: 'روزنامه', media: 'صدا و سیما', bale: 'بله', rubika: 'روبیکا',
    aparat: 'آپارات', forum: 'فروم', eitaa: 'ایتا',
  };

  const SAMPLE_SORT_OPTIONS = [
    { value: 'engagement', label: 'بیشترین تعامل (پیش‌فرض)' },
    { value: 'recent', label: 'جدیدترین پست‌ها' },
    { value: 'negative_first', label: 'منفی‌ترین پست‌ها اول' },
  ];

  // Reset when dialog opens
  useEffect(() => {
    if (open) {
      setPhase('select'); setActiveOpt(null); setDoneMsg(''); setErrorMsg('');
      setSampleLimit(80); setSortBy('engagement');
      setAvailableSources([]); setSelectedSources([]);
      // Fetch available sources from the latest run
      axios.get(endpoints.admin.ingestLatestRun(profileId)).then((res) => {
        const runId = res.data?.id;
        if (runId) {
          axios.get(`/api/admin/ingest/profiles/${profileId}/run-sources?runId=${runId}`)
            .then((r) => {
              const sources = r.data || [];
              setAvailableSources(sources);
              setSelectedSources(sources);
            })
            .catch(() => setAvailableSources([]));
        }
      }).catch(() => {});
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [open, profileId]);

  const handleClose = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    onClose();
  };

  const startPoll = (opt) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res = await axios.get(endpoints.admin.ingestLatestRun(profileId));
        const run = res.data;
        if (run && run.status !== 'running') {
          clearInterval(pollRef.current);
          if (run.status === 'completed') {
            setDoneMsg(opt.doneMsg(run.postsSelected ?? 0));
            setPhase('done');
            onStart(opt.key);
            setTimeout(() => handleClose(), 2500);
          } else {
            setErrorMsg(run.errorMessage || 'خطا در اجرا');
            setPhase('error');
          }
        }
      } catch (e) {
        clearInterval(pollRef.current);
        setErrorMsg(getErrorText(e, 'خطا در دریافت وضعیت'));
        setPhase('error');
      }
    }, 3000);
  };

  const run = async (opt) => {
    // AI-only: show customization step first
    if (opt.key === 'ai_only') {
      setActiveOpt(opt);
      setPhase('customize');
      return;
    }
    await executeRun(opt);
  };

  const executeRun = async (opt, body = null) => {
    setActiveOpt(opt);
    setPhase('running');
    try {
      const url = typeof opt.endpoint === 'function' ? opt.endpoint(profileId) : opt.endpoint;

      if (opt.synchronous) {
        const res = await axios.post(url, body, { headers: { 'X-Profile-Id': profileId } });
        const data = res.data;
        if (data?.error) { setErrorMsg(data.error); setPhase('error'); return; }
        setDoneMsg(opt.doneMsg(0, data));
        setPhase('done');
        onStart(opt.key);
        setTimeout(() => handleClose(), 3000);
      } else {
        await axios.post(url, null, { headers: { 'X-Profile-Id': profileId } });
        if (opt.pollable) {
          startPoll(opt);
        } else {
          const waitMs = opt.waitMs || 3000;
          setTimeout(() => {
            setDoneMsg(opt.doneMsg(0, null));
            setPhase('done');
            onStart(opt.key);
            setTimeout(() => handleClose(), 2500);
          }, waitMs);
        }
      }
    } catch (e) {
      // src/lib/axios rejects with the server message as a plain string.
      setErrorMsg(getErrorText(e, 'خطا در اجرا'));
      setPhase('error');
    }
  };

  return (
    <Dialog open={open} onClose={phase === 'running' ? undefined : handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="solar:refresh-bold" width={20} sx={{ color: 'primary.main' }} />
          <span>اجرا — {profileName}</span>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ pb: 2 }}>

        {/* Select phase */}
        {phase === 'select' && (
          <>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
              نوع عملیات را انتخاب کنید:
            </Typography>
            <List disablePadding>
              {INGEST_OPTIONS.map((opt, i) => (
                <ListItem key={opt.key} disablePadding sx={{ mb: i < INGEST_OPTIONS.length - 1 ? 1 : 0 }}>
                  <ListItemButton
                    onClick={() => run(opt)}
                    sx={{ borderRadius: 1.5, border: '1px solid', borderColor: 'divider', p: 1.5 }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ width: '100%' }}>
                      <Iconify icon={opt.icon} width={22} sx={{ color: opt.color }} />
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 13 }}>{opt.title}</Typography>
                        <Typography variant="caption" component="div" color="text.secondary" sx={{ fontSize: 12 }}>{opt.desc}</Typography>
                      </Box>
                    </Stack>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </>
        )}

        {/* Customize phase — AI sample options */}
        {phase === 'customize' && activeOpt && (
          <Stack spacing={2}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              تنظیم نمونه پست‌هایی که به پرامپت‌های هوش مصنوعی ارسال می‌شوند:
            </Typography>

            {/* Source filter */}
            {availableSources.length > 0 && (
              <Box>
                <Typography variant="caption" fontWeight={700} sx={{ display: 'block', mb: 0.75, fontSize: 12 }}>
                  منابع داده
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={0.75}>
                  {availableSources.map((src) => {
                    const checked = selectedSources.includes(src);
                    return (
                      <Chip
                        key={src}
                        label={SOURCE_LABELS[src] || src}
                        size="small"
                        onClick={() => setSelectedSources((prev) =>
                          checked ? prev.filter((s) => s !== src) : [...prev, src]
                        )}
                        sx={{
                          fontSize: 12, cursor: 'pointer',
                          bgcolor: checked ? (t) => alpha(t.palette.primary.main, 0.12) : 'transparent',
                          borderColor: checked ? 'primary.main' : 'divider',
                          border: '1px solid',
                          color: checked ? 'primary.main' : 'text.secondary',
                          fontWeight: checked ? 700 : 400,
                        }}
                      />
                    );
                  })}
                </Stack>
              </Box>
            )}

            {/* Sample size */}
            <Box>
              <Typography variant="caption" fontWeight={700} sx={{ display: 'block', mb: 0.75, fontSize: 12 }}>
                تعداد پست نمونه: {fNum(sampleLimit)}
              </Typography>
              <Box sx={{ px: 1 }}>
                <Slider
                  value={sampleLimit}
                  min={20}
                  max={200}
                  step={10}
                  size="small"
                  onChange={(_, v) => setSampleLimit(v)}
                  marks={[
                    { value: 20, label: '۲۰' },
                    { value: 80, label: '۸۰' },
                    { value: 200, label: '۲۰۰' },
                  ]}
                />
              </Box>
            </Box>

            {/* Sort order */}
            <Box>
              <Typography variant="caption" fontWeight={700} sx={{ display: 'block', mb: 0.75, fontSize: 12 }}>
                ترتیب انتخاب پست‌ها
              </Typography>
              <Stack spacing={0.5}>
                {SAMPLE_SORT_OPTIONS.map((o) => (
                  <Stack key={o.value} direction="row" alignItems="center" spacing={1}
                    sx={{ px: 1.25, py: 0.6, borderRadius: 1.25, border: '1px solid', borderColor: sortBy === o.value ? 'primary.main' : 'divider', bgcolor: sortBy === o.value ? (t) => alpha(t.palette.primary.main, 0.1) : 'transparent', cursor: 'pointer' }}
                    onClick={() => setSortBy(o.value)}>
                    <Iconify icon={sortBy === o.value ? 'solar:check-circle-bold' : 'solar:minus-circle-bold'} width={14} sx={{ color: sortBy === o.value ? 'primary.main' : 'text.disabled' }} />
                    <Typography variant="caption" sx={{ fontSize: 13, color: sortBy === o.value ? 'primary.main' : 'text.secondary', fontWeight: sortBy === o.value ? 700 : 400 }}>{o.label}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>

            <Stack direction="row" spacing={1} sx={{ pt: 0.5 }}>
              <Button size="small" variant="outlined" onClick={() => setPhase('select')} sx={{ flex: 1 }}>بازگشت</Button>
              <Button size="small" variant="contained" sx={{ flex: 2 }}
                onClick={() => {
                  const body = {
                    sources: selectedSources.length < availableSources.length ? selectedSources : undefined,
                    limit: sampleLimit !== 80 ? sampleLimit : undefined,
                    sortBy: sortBy !== 'engagement' ? sortBy : undefined,
                  };
                  executeRun(activeOpt, (body.sources || body.limit || body.sortBy) ? body : null);
                }}>
                <Iconify icon="solar:cpu-bolt-bold" width={16} sx={{ mr: 0.5 }} />
                اجرای تحلیل
              </Button>
            </Stack>
          </Stack>
        )}

        {/* Running phase */}
        {phase === 'running' && activeOpt && (
          <Stack alignItems="center" spacing={2} sx={{ py: 2 }}>
            <Iconify
              icon={activeOpt.icon}
              width={40}
              sx={{
                color: activeOpt.color,
                animation: 'spin 1.2s linear infinite',
                '@keyframes spin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
              }}
            />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{activeOpt.title}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
              {activeOpt.pollable ? 'در حال اجرا... لطفاً صبر کنید' : activeOpt.synchronous ? 'پرامپت‌ها در حال اجرا هستند (~۳۰ ثانیه) — لطفاً صبر کنید' : 'پرامپت‌ها در حال اجرا هستند (~۳۰ ثانیه)'}
            </Typography>
            {(activeOpt.pollable || activeOpt.waitMs || activeOpt.synchronous) && (
              <LinearProgress sx={{ width: '100%', borderRadius: 1 }} />
            )}
          </Stack>
        )}

        {/* Done phase */}
        {phase === 'done' && (
          <Stack alignItems="center" spacing={1.5} sx={{ py: 2 }}>
            <Iconify icon="solar:check-circle-bold" width={40} sx={{ color: 'success.main' }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'success.main' }}>تکمیل شد</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>{doneMsg}</Typography>
          </Stack>
        )}

        {/* Error phase */}
        {phase === 'error' && (
          <Stack alignItems="center" spacing={1.5} sx={{ py: 2 }}>
            <Iconify icon="solar:danger-triangle-bold" width={40} sx={{ color: 'error.main' }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'error.main' }}>خطا</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', wordBreak: 'break-word' }}>{errorMsg}</Typography>
            <Button size="small" onClick={() => setPhase('select')}>بازگشت</Button>
          </Stack>
        )}

      </DialogContent>
    </Dialog>
  );
}

// ── Export dialog ─────────────────────────────────────────────────────────────

function ExportDialog({ profileId, profileName, open, onClose }) {
  const [loading, setLoading] = useState(null); // null | 'posts' | 'analysis'

  const doExport = async (type) => {
    setLoading(type);
    try {
      const urlMap = {
        posts:       `${CONFIG.serverUrl}/api/admin/ingest/profiles/${profileId}/export-posts`,
        analysis:    `${CONFIG.serverUrl}/api/admin/ingest/profiles/${profileId}/export-analysis`,
        'ai-sample': `${CONFIG.serverUrl}/api/admin/ingest/profiles/${profileId}/export-ai-sample`,
      };
      const url = urlMap[type] || urlMap.posts;
      const token = sessionStorage.getItem(JWT_STORAGE_KEY);
      const res = await fetch(url, {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });
      if (!res.ok) {
        let msg = `خطا در دریافت فایل (${toFaDigits(res.status)})`;
        try {
          const body = await res.json();
          msg = body?.error?.message || body?.message || msg;
        } catch { /* not JSON */ }
        throw new Error(msg);
      }
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `${type}-${profileName}-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
      onClose();
    } catch (e) {
      console.error('Export failed:', e);
      toast.error(getErrorText(e, 'خطا در دانلود داده‌ها'));
    } finally {
      setLoading(null);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="solar:download-bold" width={20} sx={{ color: 'primary.main' }} />
          <span>دانلود داده‌ها — {profileName}</span>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ pb: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
          نوع خروجی را انتخاب کنید:
        </Typography>
        <List disablePadding>
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              onClick={() => doExport('posts')}
              disabled={!!loading}
              sx={{ borderRadius: 1.5, border: '1px solid', borderColor: 'divider', p: 1.5 }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ width: '100%' }}>
                <Iconify
                  icon={loading === 'posts' ? 'solar:refresh-bold' : 'solar:document-text-bold-duotone'}
                  width={22}
                  sx={{
                    color: 'primary.main',
                    ...(loading === 'posts' && {
                      animation: 'spin 1s linear infinite',
                      '@keyframes spin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
                    }),
                  }}
                />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 12 }}>
                    پست‌های ذخیره‌شده
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                    متن، احساس، منبع، بازدید، تاریخ و ...
                  </Typography>
                </Box>
              </Stack>
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              onClick={() => doExport('analysis')}
              disabled={!!loading}
              sx={{ borderRadius: 1.5, border: '1px solid', borderColor: 'divider', p: 1.5 }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ width: '100%' }}>
                <Iconify
                  icon={loading === 'analysis' ? 'solar:refresh-bold' : 'solar:cpu-bolt-bold'}
                  width={22}
                  sx={{
                    color: 'secondary.main',
                    ...(loading === 'analysis' && {
                      animation: 'spin 1s linear infinite',
                      '@keyframes spin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
                    }),
                  }}
                />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 12 }}>
                    نتایج تحلیل هوش مصنوعی
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                    خلاصه، پیشنهادات، شکاف روایت، طیف سیاسی و ...
                  </Typography>
                </Box>
              </Stack>
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => doExport('ai-sample')}
              disabled={!!loading}
              sx={{ borderRadius: 1.5, border: '1px solid', borderColor: 'divider', p: 1.5 }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ width: '100%' }}>
                <Iconify
                  icon={loading === 'ai-sample' ? 'solar:refresh-bold' : 'solar:widget-5-bold-duotone'}
                  width={22}
                  sx={{
                    color: 'warning.main',
                    ...(loading === 'ai-sample' && {
                      animation: 'spin 1s linear infinite',
                      '@keyframes spin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
                    }),
                  }}
                />
                <Box>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 12 }}>
                      نمونه ارسالی به هوش مصنوعی
                    </Typography>
                    <Chip label="موقت" size="small" color="warning" variant="soft" sx={{ height: 20, fontSize: 12 }} />
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                    دقیقاً همان پست‌هایی که به پرامپت‌های تحلیل ارسال شدند (تا ۸۰ پست، مرتب بر اساس تعامل)
                  </Typography>
                </Box>
              </Stack>
            </ListItemButton>
          </ListItem>
        </List>
      </DialogContent>
    </Dialog>
  );
}

// ── Per-profile ingest status chip ───────────────────────────────────────────

function IngestStatusChip({ runState }) {
  if (!runState) return null;

  if (runState.status === 'running') {
    return (
      <Chip
        size="small"
        color="info"
        variant="soft"
        icon={<Iconify icon="solar:refresh-bold" width={14} sx={{ animation: 'spin 1s linear infinite', '@keyframes spin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } } }} />}
        label="در حال جمع‌آوری..."
        sx={{ fontSize: 12 }}
      />
    );
  }
  if (runState.status === 'completed') {
    return (
      <Tooltip title={`${fNum(runState.postsSelected ?? 0)} پست انتخاب شد`}>
        <Chip
          size="small"
          color="success"
          variant="soft"
          icon={<Iconify icon="solar:check-circle-bold" width={14} />}
          label={`${fNum(runState.postsSelected ?? 0)} پست`}
          sx={{ fontSize: 12 }}
        />
      </Tooltip>
    );
  }
  if (runState.status === 'failed') {
    return (
      <Tooltip title={runState.errorMessage || 'خطا در جمع‌آوری'}>
        <Chip
          size="small"
          color="error"
          variant="soft"
          icon={<Iconify icon="solar:danger-triangle-bold" width={14} />}
          label="خطا"
          sx={{ fontSize: 12 }}
        />
      </Tooltip>
    );
  }
  return null;
}

/// ── Per-profile ingest run state (shared by card + table row) ────────────────

const SPIN_SX = {
  animation: 'spin 1s linear infinite',
  '@keyframes spin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
};

function useProfileRunState(profileId) {
  const [runState, setRunState] = useState(null);
  const [polling, setPolling] = useState(false);

  // Poll the latest run every 3s while running
  useEffect(() => {
    if (!polling) return undefined;
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(endpoints.admin.ingestLatestRun(profileId));
        const run = res.data;
        if (run) {
          setRunState({ status: run.status, postsSelected: run.postsSelected, errorMessage: run.errorMessage });
          if (run.status !== 'running') setPolling(false);
        }
      } catch {
        setPolling(false);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [polling, profileId]);

  const handleIngestStart = useCallback((type) => {
    if (type === 'ai_only') {
      // AI-only: no run record to poll, just show a brief status
      setRunState({ status: 'completed', postsSelected: 0, errorMessage: null });
      setTimeout(() => setRunState(null), 3000);
    } else {
      // Posts or full: start polling for the run record
      setRunState({ status: 'running', postsSelected: 0, errorMessage: null });
      setPolling(true);
    }
  }, []);

  return { runState, isRunning: runState?.status === 'running', handleIngestStart };
}

function profileMenuItems(p, { onEdit, onArchive, onDelete, onExport, onUsage }) {
  return [
    { label: 'ویرایش', icon: 'solar:pen-bold', onClick: () => onEdit(p) },
    { label: 'دانلود داده‌ها', icon: 'solar:download-bold', onClick: onExport },
    { label: 'آمار استفاده', icon: 'solar:chart-bold', onClick: onUsage },
    {
      label: 'غیرفعال‌سازی',
      icon: 'solar:archive-bold',
      divider: true,
      hidden: !p.isActive,
      onClick: () => onArchive(p),
    },
    { label: 'حذف دائمی', icon: 'solar:trash-bin-2-bold', color: 'error', onClick: () => onDelete(p) },
  ];
}

function RunButton({ isRunning, onClick, size = 'small' }) {
  return (
    <Tooltip title={isRunning ? 'در حال جمع‌آوری...' : 'اجرای فوری'}>
      <span>
        <IconButton
          size={size}
          disabled={isRunning}
          onClick={onClick}
          aria-label="اجرای فوری"
          sx={{ color: isRunning ? 'text.disabled' : 'primary.main' }}
        >
          <Iconify icon="solar:refresh-bold" width={18} sx={isRunning ? SPIN_SX : {}} />
        </IconButton>
      </span>
    </Tooltip>
  );
}

function TierChip({ tier }) {
  if (!tier) return null;
  return (
    <Chip
      label={TIER_LABELS[tier] || tier}
      size="small"
      color={TIER_COLORS[tier] || 'default'}
      variant="soft"
      sx={{ fontSize: 12, fontWeight: 700 }}
    />
  );
}

function MetaItem({ icon, title, children, color = 'text.secondary' }) {
  return (
    <Tooltip title={title}>
      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color, minWidth: 0 }}>
        <Iconify icon={icon} width={14} sx={{ flexShrink: 0, opacity: 0.8 }} />
        <Typography variant="caption" sx={{ fontSize: 12, color: 'inherit', whiteSpace: 'nowrap' }}>
          {children}
        </Typography>
      </Stack>
    </Tooltip>
  );
}

// ── Profile card with per-profile ingest state ────────────────────────────────

function ProfileCard({ p, onEdit, onArchive, onDelete }) {
  const { runState, isRunning, handleIngestStart } = useProfileRunState(p.id);
  const [exportOpen, setExportOpen] = useState(false);
  const [ingestOpen, setIngestOpen] = useState(false);
  const [usageOpen, setUsageOpen] = useState(false);

  return (
    <Card sx={{ overflow: 'hidden', opacity: p.isActive ? 1 : 0.65 }}>
      {/* Progress bar — only visible while running */}
      {isRunning && <LinearProgress sx={{ height: 2, borderRadius: 0 }} color="info" />}

      <Box sx={{ p: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
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
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>
              {p.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap sx={{ fontSize: 13 }}>
              {[p.role, p.organization].filter(Boolean).join(' — ') || '—'}
            </Typography>

            <Stack direction="row" alignItems="center" sx={{ mt: 1, flexWrap: 'wrap', gap: 0.75 }}>
              <TierChip tier={p.tier} />
              {!p.isActive && <Chip label="غیرفعال" size="small" variant="soft" sx={{ fontSize: 12 }} />}
              <IngestStatusChip runState={runState} />
            </Stack>

            {/* Compact stats row */}
            <Stack direction="row" alignItems="center" sx={{ mt: 1, flexWrap: 'wrap', columnGap: 2, rowGap: 0.5 }}>
              <MetaItem icon="solar:document-text-bold" title="تعداد پست">{fNum(p.postCount ?? 0)}</MetaItem>
              <MetaItem icon="solar:user-bold" title="تعداد کاربر">{fNum(p.userCount ?? 0)}</MetaItem>
              <MetaItem icon="solar:database-bold" title="منابع داده">{fNum(p.sourceCount ?? 0)}</MetaItem>
              <MetaItem icon="solar:magnifer-bold" title="کلیدواژه‌های جستجو">{fNum(p.keywords?.length ?? 0)}</MetaItem>
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
            <Stack direction="row" alignItems="center" sx={{ mt: 0.75, flexWrap: 'wrap', columnGap: 2, rowGap: 0.5 }}>
              <MetaItem icon="solar:history-bold" title="آخرین جمع‌آوری">
                {p.lastFetchAt
                  ? `${fDateTime(p.lastFetchAt)}${p.lastFetchPosts != null ? ` · ${fNum(p.lastFetchPosts)} پست` : ''}`
                  : 'هنوز جمع‌آوری نشده'}
              </MetaItem>
              {p.nextFetchAt && (
                <MetaItem icon="solar:calendar-bold" title="جمع‌آوری بعدی" color="info.main">
                  {fDateTime(p.nextFetchAt)}
                </MetaItem>
              )}
              {p.lastAiAt && (
                <MetaItem icon="solar:cpu-bolt-bold" title="آخرین تحلیل هوش مصنوعی" color="secondary.main">
                  {`AI: ${fDateTime(p.lastAiAt)}`}
                </MetaItem>
              )}
            </Stack>
          </Box>

          {/* Actions */}
          <Stack direction="row" spacing={0.25} alignItems="center" sx={{ flexShrink: 0 }}>
            <RunButton isRunning={isRunning} onClick={() => setIngestOpen(true)} />
            <RowActionsMenu
              items={profileMenuItems(p, {
                onEdit,
                onArchive,
                onDelete,
                onExport: () => setExportOpen(true),
                onUsage: () => setUsageOpen(true),
              })}
            />
          </Stack>
        </Stack>
      </Box>

      <ExportDialog
        profileId={p.id}
        profileName={p.name}
        open={exportOpen}
        onClose={() => setExportOpen(false)}
      />

      <IngestActionDialog
        profileId={p.id}
        profileName={p.name}
        open={ingestOpen}
        onClose={() => setIngestOpen(false)}
        onStart={handleIngestStart}
      />

      <ProfileUsageDialog
        profileId={p.id}
        profileName={p.name}
        open={usageOpen}
        onClose={() => setUsageOpen(false)}
      />
    </Card>
  );
}

// ── Desktop table row ─────────────────────────────────────────────────────────

function ProfileTableRow({ p, onEdit, onArchive, onDelete }) {
  const { runState, isRunning, handleIngestStart } = useProfileRunState(p.id);
  const [exportOpen, setExportOpen] = useState(false);
  const [ingestOpen, setIngestOpen] = useState(false);
  const [usageOpen, setUsageOpen] = useState(false);

  return (
    <TableRow sx={{ opacity: p.isActive ? 1 : 0.6 }}>
      {/* Avatar + name */}
      <TableCell sx={{ py: 1.25, pl: 2.5 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Avatar src={p.avatar} sx={{ width: 36, height: 36, fontSize: 14, fontWeight: 700, bgcolor: p.primaryColor || 'primary.main', flexShrink: 0 }}>
            {p.name?.charAt(0)}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700 }}>{p.name}</Typography>
            <Typography variant="caption" component="div" color="text.secondary" noWrap sx={{ fontSize: 12, maxWidth: 280 }}>
              {[p.role, p.organization].filter(Boolean).join(' — ') || '—'}
            </Typography>
          </Box>
        </Stack>
      </TableCell>

      {/* Tier + status */}
      <TableCell>
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5 }}>
          <TierChip tier={p.tier} />
          <Chip
            label={p.isActive ? 'فعال' : 'غیرفعال'}
            size="small"
            variant="soft"
            color={p.isActive ? 'success' : 'default'}
            sx={{ fontSize: 12 }}
          />
          <IngestStatusChip runState={runState} />
        </Stack>
      </TableCell>

      {/* Stats */}
      <TableCell align="center" sx={{ fontWeight: 600 }}>{fNum(p.postCount ?? 0)}</TableCell>
      <TableCell align="center">{fNum(p.userCount ?? 0)}</TableCell>
      <TableCell align="center">{fNum(p.keywords?.length ?? 0)}</TableCell>

      {/* Last fetch / AI */}
      <TableCell>
        <Stack spacing={0.5}>
          <MetaItem icon="solar:history-bold" title="آخرین جمع‌آوری" color={p.lastFetchAt ? 'text.secondary' : 'text.disabled'}>
            {p.lastFetchAt ? fDateTime(p.lastFetchAt) : 'جمع‌آوری نشده'}
          </MetaItem>
          {p.lastAiAt && (
            <MetaItem icon="solar:cpu-bolt-bold" title="آخرین تحلیل هوش مصنوعی" color="secondary.main">
              {fDateTime(p.lastAiAt)}
            </MetaItem>
          )}
        </Stack>
      </TableCell>

      {/* Actions */}
      <TableCell align="right" sx={{ pr: 1.5, whiteSpace: 'nowrap' }}>
        <RunButton isRunning={isRunning} onClick={() => setIngestOpen(true)} />
        <RowActionsMenu
          items={profileMenuItems(p, {
            onEdit,
            onArchive,
            onDelete,
            onExport: () => setExportOpen(true),
            onUsage: () => setUsageOpen(true),
          })}
        />
        <ExportDialog profileId={p.id} profileName={p.name} open={exportOpen} onClose={() => setExportOpen(false)} />
        <IngestActionDialog profileId={p.id} profileName={p.name} open={ingestOpen} onClose={() => setIngestOpen(false)} onStart={handleIngestStart} />
        <ProfileUsageDialog profileId={p.id} profileName={p.name} open={usageOpen} onClose={() => setUsageOpen(false)} />
      </TableCell>
    </TableRow>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

export function AdminProfilesView() {
  const { desktopMode } = useAdminDesktopMode();

  const { data: profiles = [], isLoading } = useAdminProfiles();
  const archive = useArchiveProfile();
  const deleteProfile = useDeleteProfile();

  const [editing, setEditing] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [batchImportOpen, setBatchImportOpen] = useState(false);
  const [sortKey, setSortKey] = useState('name_asc');
  const [search, setSearch] = useState('');
  const [filterTier, setFilterTier] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterHasAi, setFilterHasAi] = useState('');
  const [viewMode, setViewMode] = useState('cards');

  // Sync viewMode when desktopMode changes
  useEffect(() => {
    setViewMode(desktopMode ? 'table' : 'cards');
  }, [desktopMode]);

  // In desktop mode, respect the toggle; in mobile always use cards
  const useTable = desktopMode && viewMode === 'table';

  const filtered = useMemo(
    () => filterProfiles(profiles, { search, tier: filterTier, status: filterStatus, hasAi: filterHasAi }),
    [profiles, search, filterTier, filterStatus, filterHasAi]
  );
  const sorted = useMemo(() => sortProfiles(filtered, sortKey), [filtered, sortKey]);

  const activeFilterCount = [filterTier, filterStatus, filterHasAi].filter(Boolean).length;

  const openNew = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (p) => { setEditing(p); setDialogOpen(true); };

  const handleArchive = (p) => {
    if (!window.confirm(`پروفایل «${p.name}» غیرفعال شود؟`)) return;
    archive.mutate(p.id, {
      onSuccess: () => toast.success(`پروفایل «${p.name}» غیرفعال شد`),
      onError: (e) => toast.error(getErrorText(e, 'خطا در غیرفعال‌سازی پروفایل')),
    });
  };
  const handleDelete = (p) => {
    if (!window.confirm(`پروفایل «${p.name}» برای همیشه حذف شود؟\n\nاین عمل قابل بازگشت نیست.`)) return;
    deleteProfile.mutate(p.id, {
      onSuccess: () => toast.success(`پروفایل «${p.name}» حذف شد`),
      onError: (e) => toast.error(getErrorText(e, 'خطا در حذف پروفایل')),
    });
  };

  const selectSx = { minWidth: { xs: 'calc(50% - 4px)', sm: 140 }, flex: { xs: 1, sm: 'none' } };

  return (
    <Container maxWidth={desktopMode ? 'xl' : 'lg'} sx={{ py: { xs: 3, md: 4 } }}>
      <AdminPageHeader
        title="مدیریت پروفایل‌ها"
        subtitle="هر پروفایل نماینده یک کلاینت / تحلیل‌شونده در سیستم است."
        action={
          <>
            <Button
              variant="outlined"
              startIcon={<Iconify icon="solar:import-bold" width={18} />}
              onClick={() => setBatchImportOpen(true)}
            >
              درج دسته‌جمعی
            </Button>
            <Button variant="contained" startIcon={<Iconify icon="eva:plus-fill" />} onClick={openNew}>
              پروفایل جدید
            </Button>
          </>
        }
      />

      {/* ── Toolbar ── */}
      <Card sx={{ mb: 2, p: { xs: 1.5, md: 2 } }}>
        <Stack spacing={1.5}>
          {/* Search row */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{
              flex: 1, display: 'flex', alignItems: 'center', gap: 1,
              px: 1.5, py: 0.75, borderRadius: 1.5,
              border: '1px solid', borderColor: 'divider',
              bgcolor: 'background.neutral',
            }}>
              <Iconify icon="solar:magnifer-bold" width={18} sx={{ color: 'text.disabled', flexShrink: 0 }} />
              <InputBase
                fullWidth
                placeholder="جستجو بر اساس نام، نقش یا سازمان..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ fontSize: 14, '& input': { p: 0 } }}
                inputProps={{ dir: 'rtl', 'aria-label': 'جستجوی پروفایل' }}
              />
              {search && (
                <IconButton size="small" onClick={() => setSearch('')} sx={{ p: 0.25 }} aria-label="پاک کردن جستجو">
                  <Iconify icon="solar:close-circle-bold" width={16} sx={{ color: 'text.disabled' }} />
                </IconButton>
              )}
            </Box>

            {/* View toggle — desktop mode only */}
            {desktopMode && (
              <ToggleButtonGroup
                size="small"
                value={viewMode}
                exclusive
                onChange={(_, v) => { if (v) setViewMode(v); }}
                sx={{ flexShrink: 0 }}
              >
                <ToggleButton value="cards" title="کارت" aria-label="نمای کارت">
                  <Iconify icon="solar:widget-5-bold" width={16} />
                </ToggleButton>
                <ToggleButton value="table" title="جدول" aria-label="نمای جدول">
                  <Iconify icon="solar:list-bold" width={16} />
                </ToggleButton>
              </ToggleButtonGroup>
            )}
          </Stack>

          {/* Filter row */}
          <Stack direction="row" alignItems="center" sx={{ flexWrap: 'wrap', gap: 1 }}>
            <FormControl size="small" sx={selectSx}>
              <Select value={filterTier} onChange={(e) => setFilterTier(e.target.value)} displayEmpty
                renderValue={(v) => v ? TIER_LABELS[v] : 'همه تیرها'}>
                <MenuItem value="">همه تیرها</MenuItem>
                <MenuItem value="heavy">سنگین</MenuItem>
                <MenuItem value="medium">متوسط</MenuItem>
                <MenuItem value="light">سبک</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={selectSx}>
              <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} displayEmpty
                renderValue={(v) => v === 'active' ? 'فعال' : v === 'inactive' ? 'غیرفعال' : 'همه وضعیت‌ها'}>
                <MenuItem value="">همه وضعیت‌ها</MenuItem>
                <MenuItem value="active">فعال</MenuItem>
                <MenuItem value="inactive">غیرفعال</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={selectSx}>
              <Select value={filterHasAi} onChange={(e) => setFilterHasAi(e.target.value)} displayEmpty
                renderValue={(v) => v === 'yes' ? 'دارای تحلیل AI' : v === 'no' ? 'بدون تحلیل AI' : 'همه (AI)'}>
                <MenuItem value="">همه (AI)</MenuItem>
                <MenuItem value="yes">دارای تحلیل AI</MenuItem>
                <MenuItem value="no">بدون تحلیل AI</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={selectSx}>
              <Select value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
                {SORT_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
              </Select>
            </FormControl>

            {activeFilterCount > 0 && (
              <Button size="small" variant="outlined" color="error"
                onClick={() => { setFilterTier(''); setFilterStatus(''); setFilterHasAi(''); }}
                startIcon={<Iconify icon="solar:close-circle-bold" width={14} />}
                sx={{ fontSize: 12 }}>
                پاک کردن فیلترها ({fNum(activeFilterCount)})
              </Button>
            )}

            <Typography variant="caption" sx={{ ml: { sm: 'auto' }, fontSize: 12, color: 'text.secondary' }}>
              {fNum(sorted.length)} از {fNum(profiles.length)} پروفایل
            </Typography>
          </Stack>
        </Stack>
      </Card>

      {/* ── Content ── */}
      {isLoading || sorted.length === 0 ? (
        <AdminListState
          loading={isLoading}
          empty={!isLoading}
          icon="solar:user-id-bold"
          emptyText={profiles.length === 0 ? 'هنوز پروفایلی ایجاد نشده است.' : 'پروفایلی با این فیلترها یافت نشد.'}
        />
      ) : useTable ? (
        /* ── Desktop table view ── */
        <AdminTableCard>
          <Table size="small" stickyHeader sx={[adminTableSx, { minWidth: 960 }]}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ pl: 2.5 }}>پروفایل</TableCell>
                <TableCell>تیر / وضعیت</TableCell>
                <TableCell align="center">پست</TableCell>
                <TableCell align="center">کاربر</TableCell>
                <TableCell align="center">کلیدواژه</TableCell>
                <TableCell>آخرین فعالیت</TableCell>
                <TableCell align="right" sx={{ pr: 1.5, width: 110 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {sorted.map((p) => (
                <ProfileTableRow
                  key={p.id}
                  p={p}
                  onEdit={openEdit}
                  onArchive={handleArchive}
                  onDelete={handleDelete}
                />
              ))}
            </TableBody>
          </Table>
        </AdminTableCard>
      ) : (
        /* ── Card view (mobile, or desktop with the card toggle) ── */
        <Box
          sx={{
            display: 'grid',
            gap: 1.5,
            gridTemplateColumns: { xs: '1fr', lg: desktopMode ? 'repeat(2, 1fr)' : '1fr' },
          }}
        >
          {sorted.map((p) => (
            <ProfileCard
              key={p.id}
              p={p}
              onEdit={openEdit}
              onArchive={handleArchive}
              onDelete={handleDelete}
            />
          ))}
        </Box>
      )}

      <ProfileFormDialog
        open={dialogOpen}
        profile={editing}
        onClose={() => setDialogOpen(false)}
      />

      <BatchImportDialog
        open={batchImportOpen}
        onClose={() => setBatchImportOpen(false)}
      />
    </Container>
  );
}
