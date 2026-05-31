'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Container from '@mui/material/Container';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import TableContainer from '@mui/material/TableContainer';
import { alpha, useTheme } from '@mui/material/styles';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { useAdminUsers, useActivityFeed } from 'src/api/admin';

import { Iconify } from 'src/components/iconify';

import { useAdminDesktopMode } from 'src/contexts/admin-desktop-mode';
import { AdminPageHeader } from '../shared/page-header';

// ----------------------------------------------------------------------

const CATEGORIES = [
  { value: null,      label: 'همه',         icon: 'solar:list-bold-duotone' },
  { value: 'ingest',  label: 'جمع‌آوری',    icon: 'solar:cloud-download-bold-duotone' },
  { value: 'admin',   label: 'عملیات مدیر', icon: 'solar:shield-user-bold-duotone' },
];

const STATUS_CONFIG = {
  completed: { color: 'success', icon: 'solar:check-circle-bold', label: 'موفق' },
  failed:    { color: 'error',   icon: 'solar:danger-triangle-bold', label: 'خطا' },
  running:   { color: 'info',    icon: 'solar:refresh-bold', label: 'در حال اجرا' },
};

const CATEGORY_CONFIG = {
  ingest: { color: '#0088cc', icon: 'solar:cloud-download-bold-duotone', label: 'جمع‌آوری' },
  admin:  { color: '#8E33FF', icon: 'solar:shield-user-bold-duotone', label: 'مدیریت' },
};

// ----------------------------------------------------------------------

export function AdminAuditLogView() {
  const theme = useTheme();
  const [category, setCategory] = useState(null);
  const { desktopMode } = useAdminDesktopMode();

  const { data: items = [], isLoading } = useActivityFeed(category);
  const { data: users = [] } = useAdminUsers();

  const userById = Object.fromEntries((users || []).map((u) => [u.id, u]));

  const resolveActor = (item) => {
    if (item.actorId && userById[item.actorId]) return userById[item.actorId].name;
    if (item.actor === 'سیستم (زمان‌بندی)') return 'زمان‌بندی خودکار';
    return item.actor || '—';
  };

  return (
    <Container maxWidth={desktopMode ? 'xl' : 'lg'} sx={{ py: 4 }}>
      <AdminPageHeader
        title="لاگ مدیریتی"
        subtitle="تاریخچه عملیات سیستم: جمع‌آوری داده، پردازش هوش مصنوعی و اقدامات مدیریتی"
      />

      {/* Category filter */}
      <Card sx={{ p: 1.5, mb: 2 }}>
        <ToggleButtonGroup
          value={category}
          exclusive
          onChange={(_, v) => setCategory(v)}
          size="small"
          sx={{ gap: 0.5 }}
        >
          {CATEGORIES.map((cat) => (
            <ToggleButton
              key={cat.value ?? 'all'}
              value={cat.value}
              sx={{
                px: 1.5, py: 0.5, borderRadius: '8px !important',
                border: 'none !important',
                fontSize: 11, fontWeight: 600,
                '&.Mui-selected': {
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                  color: theme.palette.primary.main,
                },
              }}
            >
              <Iconify icon={cat.icon} width={14} sx={{ mr: 0.5 }} />
              {cat.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Card>

      {/* Activity list */}
      {isLoading ? (
        <Card sx={{ p: 3 }}>در حال بارگذاری...</Card>
      ) : items.length === 0 ? (
        <Card sx={{ p: 3, textAlign: 'center' }}>
          <Iconify icon="solar:document-text-bold-duotone" width={36} sx={{ color: 'text.disabled', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">رویدادی یافت نشد.</Typography>
        </Card>
      ) : desktopMode ? (
        /* ── Desktop: dense table ── */
        <Card sx={{ overflow: 'hidden' }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.neutral' }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, py: 1.25, pl: 2, width: 130 }}>زمان</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, py: 1.25, width: 90 }}>دسته</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, py: 1.25 }}>خلاصه</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, py: 1.25, width: 140 }}>پروفایل</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, py: 1.25, width: 120 }}>کاربر / منبع</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, py: 1.25, width: 70 }}>مدت</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12, py: 1.25, width: 80 }}>وضعیت</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => {
                  const catConfig = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.admin;
                  const statusConfig = STATUS_CONFIG[item.status] || STATUS_CONFIG.completed;
                  const actor = resolveActor(item);
                  const time = new Date(item.timestamp).toLocaleString('fa-IR', {
                    month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                    timeZone: 'Asia/Tehran',
                  });
                  return (
                    <TableRow key={item.id} hover sx={{
                      '&:last-child td': { border: 0 },
                      borderRight: `3px solid ${item.status === 'failed' ? theme.palette.error.main : catConfig.color}`,
                    }}>
                      <TableCell sx={{ py: 0.75, pl: 2 }}>
                        <Typography variant="caption" sx={{ fontSize: 11, color: 'text.secondary' }}>{time}</Typography>
                      </TableCell>
                      <TableCell sx={{ py: 0.75 }}>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <Iconify icon={catConfig.icon} width={13} sx={{ color: catConfig.color, flexShrink: 0 }} />
                          <Typography variant="caption" sx={{ fontSize: 11, color: catConfig.color, fontWeight: 600 }}>
                            {catConfig.label}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ py: 0.75 }}>
                        <Typography variant="caption" sx={{ fontSize: 12, fontWeight: 600 }}>{item.summary}</Typography>
                        {item.error && (
                          <Typography variant="caption" sx={{ display: 'block', fontSize: 10, color: 'error.main', mt: 0.25 }}>
                            {item.error}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ py: 0.75 }}>
                        <Typography variant="caption" sx={{ fontSize: 11, color: 'text.secondary' }}>
                          {item.profileName || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 0.75 }}>
                        <Typography variant="caption" sx={{ fontSize: 11, color: 'text.secondary' }}>{actor}</Typography>
                      </TableCell>
                      <TableCell sx={{ py: 0.75 }}>
                        {item.duration != null ? (
                          <Typography variant="caption" sx={{ fontSize: 11, color: 'text.disabled' }}>
                            {item.duration < 60 ? `${item.duration}s` : `${Math.round(item.duration / 60)}m`}
                          </Typography>
                        ) : '—'}
                      </TableCell>
                      <TableCell sx={{ py: 0.75 }}>
                        <Chip size="small"
                          icon={<Iconify icon={statusConfig.icon} width={10} />}
                          label={statusConfig.label}
                          color={statusConfig.color}
                          variant="outlined"
                          sx={{ height: 18, fontSize: 9, fontWeight: 700 }} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      ) : (
        /* ── Mobile: card layout ── */
        <Stack spacing={1}>
          {items.map((item) => {
            const catConfig = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.admin;
            const statusConfig = STATUS_CONFIG[item.status] || STATUS_CONFIG.completed;
            const actor = resolveActor(item);
            const time = new Date(item.timestamp).toLocaleString('fa-IR', {
              month: 'short', day: 'numeric',
              hour: '2-digit', minute: '2-digit',
              timeZone: 'Asia/Tehran',
            });

            return (
              <Card
                key={item.id}
                sx={{
                  p: 1.5,
                  borderRight: `3px solid ${item.status === 'failed' ? theme.palette.error.main : catConfig.color}`,
                  opacity: item.status === 'running' ? 0.7 : 1,
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <Box sx={{ width: 32, height: 32, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(catConfig.color, 0.1), flexShrink: 0, mt: 0.25 }}>
                    <Iconify icon={catConfig.icon} width={16} sx={{ color: catConfig.color }} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" alignItems="center" spacing={0.75} flexWrap="wrap">
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 12 }}>{item.summary}</Typography>
                      <Chip size="small" icon={<Iconify icon={statusConfig.icon} width={10} />} label={statusConfig.label} color={statusConfig.color} variant="outlined" sx={{ height: 18, fontSize: 9, fontWeight: 700 }} />
                    </Stack>
                    <Stack direction="row" spacing={1.5} sx={{ mt: 0.5 }} flexWrap="wrap">
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Iconify icon="solar:clock-circle-bold" width={11} sx={{ color: 'text.disabled' }} />
                        <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>{time}</Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Iconify icon="solar:user-bold" width={11} sx={{ color: 'text.disabled' }} />
                        <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>{actor}</Typography>
                      </Stack>
                      {item.profileName && (
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <Iconify icon="solar:user-id-bold" width={11} sx={{ color: 'text.disabled' }} />
                          <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>{item.profileName}</Typography>
                        </Stack>
                      )}
                      {item.duration != null && (
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <Iconify icon="solar:stopwatch-bold" width={11} sx={{ color: 'text.disabled' }} />
                          <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
                            {item.duration < 60 ? `${item.duration} ثانیه` : `${Math.round(item.duration / 60)} دقیقه`}
                          </Typography>
                        </Stack>
                      )}
                    </Stack>
                    {item.error && (
                      <Box sx={{ mt: 0.75, p: 0.75, borderRadius: 0.75, bgcolor: alpha(theme.palette.error.main, 0.06), border: `1px solid ${alpha(theme.palette.error.main, 0.12)}` }}>
                        <Typography variant="caption" sx={{ fontSize: 10, color: 'error.dark', lineHeight: 1.5 }}>{item.error}</Typography>
                      </Box>
                    )}
                  </Box>
                </Stack>
              </Card>
            );
          })}
        </Stack>
      )}
    </Container>
  );
}
