'use client';

import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import { alpha, useTheme } from '@mui/material/styles';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { fNum, toFaDigits, fRelativeFa } from 'src/utils/format-number-fa';

import { useAdminUsers, useActivityFeed } from 'src/api/admin';
import { useAdminDesktopMode } from 'src/contexts/admin-desktop-mode';

import { Iconify } from 'src/components/iconify';

import { AdminPageHeader } from '../shared/page-header';
import { adminTableSx, AdminListState, AdminTableCard } from '../shared/admin-ui';

// ----------------------------------------------------------------------

const CATEGORIES = [
  { value: null, label: 'همه', icon: 'solar:list-bold-duotone' },
  { value: 'ingest', label: 'جمع‌آوری', icon: 'solar:cloud-download-bold-duotone' },
  { value: 'admin', label: 'عملیات مدیر', icon: 'solar:shield-user-bold-duotone' },
];

const STATUS_CONFIG = {
  completed: { color: 'success', icon: 'solar:check-circle-bold', label: 'موفق' },
  failed: { color: 'error', icon: 'solar:danger-triangle-bold', label: 'خطا' },
  running: { color: 'info', icon: 'solar:refresh-bold', label: 'در حال اجرا' },
};

// Palette keys (not hex) so both themes stay readable.
const CATEGORY_CONFIG = {
  ingest: { color: 'info', icon: 'solar:cloud-download-bold-duotone', label: 'جمع‌آوری' },
  admin: { color: 'secondary', icon: 'solar:shield-user-bold-duotone', label: 'مدیریت' },
};

function formatTime(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('fa-IR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Tehran',
  });
}

function formatDuration(sec) {
  if (sec == null) return null;
  if (sec < 60) return `${fNum(sec)} ثانیه`;
  return `${fNum(Math.round(sec / 60))} دقیقه`;
}

// ----------------------------------------------------------------------

export function AdminAuditLogView() {
  const theme = useTheme();
  const [category, setCategory] = useState(null);
  const { desktopMode } = useAdminDesktopMode();

  const { data: items = [], isLoading } = useActivityFeed(category);
  const { data: users = [] } = useAdminUsers();

  const userById = useMemo(
    () => Object.fromEntries((users || []).map((u) => [u.id, u])),
    [users]
  );

  const resolveActor = (item) => {
    if (item.actorId && userById[item.actorId]) return userById[item.actorId].name;
    if (item.actor === 'سیستم (زمان‌بندی)') return 'زمان‌بندی خودکار';
    return item.actor || '—';
  };

  const failedCount = items.filter((it) => it.status === 'failed').length;

  const statusChip = (statusConfig) => (
    <Chip
      size="small"
      variant="soft"
      icon={<Iconify icon={statusConfig.icon} width={14} />}
      label={statusConfig.label}
      color={statusConfig.color}
      sx={{ fontSize: 12, fontWeight: 700 }}
    />
  );

  return (
    <Container maxWidth={desktopMode ? 'xl' : 'lg'} sx={{ py: { xs: 3, md: 4 } }}>
      <AdminPageHeader
        title="لاگ مدیریتی"
        subtitle="تاریخچه عملیات سیستم: جمع‌آوری داده، پردازش هوش مصنوعی و اقدامات مدیریتی"
      />

      {/* Category filter */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent="space-between"
        spacing={1.5}
        sx={{ mb: 2 }}
      >
        <ToggleButtonGroup
          value={category}
          exclusive
          onChange={(_, v) => setCategory(v)}
          size="small"
          sx={{ gap: 0.5, flexWrap: 'wrap', bgcolor: 'background.paper', p: 0.5, borderRadius: 1.5 }}
        >
          {CATEGORIES.map((cat) => (
            <ToggleButton
              key={cat.value ?? 'all'}
              value={cat.value}
              sx={{
                px: 1.5,
                py: 0.5,
                gap: 0.75,
                borderRadius: '8px !important',
                border: 'none !important',
                fontSize: 13,
                fontWeight: 600,
                '&.Mui-selected': {
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                  color: 'primary.main',
                },
              }}
            >
              <Iconify icon={cat.icon} width={16} />
              {cat.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        {!isLoading && items.length > 0 && (
          <Stack direction="row" spacing={1}>
            <Chip size="small" variant="outlined" label={`${fNum(items.length)} رویداد`} sx={{ fontSize: 12 }} />
            {failedCount > 0 && (
              <Chip
                size="small"
                variant="soft"
                color="error"
                label={`${fNum(failedCount)} خطا`}
                sx={{ fontSize: 12 }}
              />
            )}
          </Stack>
        )}
      </Stack>

      {/* Activity list */}
      {isLoading || items.length === 0 ? (
        <AdminListState
          loading={isLoading}
          empty={!isLoading}
          emptyText="رویدادی یافت نشد."
          icon="solar:document-text-bold-duotone"
        />
      ) : desktopMode ? (
        /* ── Desktop: dense table ── */
        <AdminTableCard>
          <Table size="small" stickyHeader sx={adminTableSx}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ pl: 2.5, width: 150 }}>زمان</TableCell>
                <TableCell sx={{ width: 120 }}>دسته</TableCell>
                <TableCell>خلاصه</TableCell>
                <TableCell sx={{ width: 160 }}>پروفایل</TableCell>
                <TableCell sx={{ width: 150 }}>کاربر / منبع</TableCell>
                <TableCell sx={{ width: 90 }}>مدت</TableCell>
                <TableCell sx={{ width: 120 }}>وضعیت</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => {
                const catConfig = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.admin;
                const statusConfig = STATUS_CONFIG[item.status] || STATUS_CONFIG.completed;
                const failed = item.status === 'failed';
                return (
                  <TableRow
                    key={item.id}
                    sx={{
                      boxShadow: `inset -3px 0 0 ${failed ? theme.vars.palette.error.main : theme.vars.palette[catConfig.color].main}`,
                    }}
                  >
                    <TableCell sx={{ pl: 2.5, whiteSpace: 'nowrap' }}>
                      <Tooltip title={fRelativeFa(item.timestamp)}>
                        <Typography variant="caption" sx={{ fontSize: 12, color: 'text.secondary' }}>
                          {formatTime(item.timestamp)}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={0.75}>
                        <Iconify
                          icon={catConfig.icon}
                          width={16}
                          sx={{ color: `${catConfig.color}.main`, flexShrink: 0 }}
                        />
                        <Typography
                          variant="caption"
                          sx={{ fontSize: 12, color: `${catConfig.color}.main`, fontWeight: 600 }}
                        >
                          {catConfig.label}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: 13, fontWeight: 600 }}>
                        {toFaDigits(item.summary)}
                      </Typography>
                      {item.error && (
                        <Typography
                          variant="caption"
                          sx={{ display: 'block', fontSize: 12, color: 'error.main', mt: 0.25 }}
                        >
                          {item.error}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{item.profileName || '—'}</TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{resolveActor(item)}</TableCell>
                    <TableCell sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
                      {formatDuration(item.duration) || '—'}
                    </TableCell>
                    <TableCell>{statusChip(statusConfig)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </AdminTableCard>
      ) : (
        /* ── Mobile: card layout ── */
        <Stack spacing={1.25}>
          {items.map((item) => {
            const catConfig = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.admin;
            const statusConfig = STATUS_CONFIG[item.status] || STATUS_CONFIG.completed;
            const failed = item.status === 'failed';
            const duration = formatDuration(item.duration);
            const meta = [
              { icon: 'solar:clock-circle-bold', text: formatTime(item.timestamp) },
              { icon: 'solar:user-bold', text: resolveActor(item) },
              item.profileName && { icon: 'solar:user-id-bold', text: item.profileName },
              duration && { icon: 'solar:stopwatch-bold', text: duration },
            ].filter(Boolean);

            return (
              <Card
                key={item.id}
                sx={{
                  p: 1.75,
                  boxShadow: `inset -3px 0 0 ${failed ? theme.vars.palette.error.main : theme.vars.palette[catConfig.color].main}`,
                  opacity: item.status === 'running' ? 0.8 : 1,
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: alpha(theme.palette[catConfig.color].main, 0.12),
                      flexShrink: 0,
                    }}
                  >
                    <Iconify icon={catConfig.icon} width={18} sx={{ color: `${catConfig.color}.main` }} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 13, minWidth: 0 }}>
                        {toFaDigits(item.summary)}
                      </Typography>
                      {statusChip(statusConfig)}
                    </Stack>
                    <Stack direction="row" sx={{ mt: 0.75, flexWrap: 'wrap', columnGap: 1.5, rowGap: 0.5 }}>
                      {meta.map((m) => (
                        <Stack key={m.icon} direction="row" alignItems="center" spacing={0.5}>
                          <Iconify icon={m.icon} width={14} sx={{ color: 'text.disabled' }} />
                          <Typography variant="caption" sx={{ fontSize: 12, color: 'text.secondary' }}>
                            {m.text}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                    {item.error && (
                      <Box
                        sx={{
                          mt: 1,
                          p: 1,
                          borderRadius: 1,
                          bgcolor: alpha(theme.palette.error.main, 0.08),
                          border: `1px solid ${alpha(theme.palette.error.main, 0.16)}`,
                        }}
                      >
                        <Typography
                          variant="caption"
                          component="div"
                          sx={{ fontSize: 12, color: 'error.main', lineHeight: 1.6, wordBreak: 'break-word' }}
                        >
                          {item.error}
                        </Typography>
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
