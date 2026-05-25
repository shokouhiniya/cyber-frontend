'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import { alpha, useTheme } from '@mui/material/styles';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { useAdminUsers, useActivityFeed } from 'src/api/admin';

import { Iconify } from 'src/components/iconify';

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

  const { data: items = [], isLoading } = useActivityFeed(category);
  const { data: users = [] } = useAdminUsers();

  const userById = Object.fromEntries((users || []).map((u) => [u.id, u]));

  const resolveActor = (item) => {
    if (item.actorId && userById[item.actorId]) return userById[item.actorId].name;
    if (item.actor === 'سیستم (زمان‌بندی)') return 'زمان‌بندی خودکار';
    return item.actor || '—';
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
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
      ) : (
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
                  {/* Category icon */}
                  <Box
                    sx={{
                      width: 32, height: 32, borderRadius: 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      bgcolor: alpha(catConfig.color, 0.1),
                      flexShrink: 0, mt: 0.25,
                    }}
                  >
                    <Iconify icon={catConfig.icon} width={16} sx={{ color: catConfig.color }} />
                  </Box>

                  {/* Content */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    {/* Top row: summary + status */}
                    <Stack direction="row" alignItems="center" spacing={0.75} flexWrap="wrap">
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 12 }}>
                        {item.summary}
                      </Typography>
                      <Chip
                        size="small"
                        icon={<Iconify icon={statusConfig.icon} width={10} />}
                        label={statusConfig.label}
                        color={statusConfig.color}
                        variant="outlined"
                        sx={{ height: 18, fontSize: 9, fontWeight: 700 }}
                      />
                    </Stack>

                    {/* Meta row */}
                    <Stack direction="row" spacing={1.5} sx={{ mt: 0.5 }} flexWrap="wrap">
                      {/* Time */}
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Iconify icon="solar:clock-circle-bold" width={11} sx={{ color: 'text.disabled' }} />
                        <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
                          {time}
                        </Typography>
                      </Stack>

                      {/* Actor */}
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Iconify icon="solar:user-bold" width={11} sx={{ color: 'text.disabled' }} />
                        <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
                          {actor}
                        </Typography>
                      </Stack>

                      {/* Profile */}
                      {item.profileName && (
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <Iconify icon="solar:user-id-bold" width={11} sx={{ color: 'text.disabled' }} />
                          <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
                            {item.profileName}
                          </Typography>
                        </Stack>
                      )}

                      {/* Duration (ingest only) */}
                      {item.duration != null && (
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <Iconify icon="solar:stopwatch-bold" width={11} sx={{ color: 'text.disabled' }} />
                          <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
                            {item.duration < 60 ? `${item.duration} ثانیه` : `${Math.round(item.duration / 60)} دقیقه`}
                          </Typography>
                        </Stack>
                      )}
                    </Stack>

                    {/* Error message (if failed) */}
                    {item.error && (
                      <Box
                        sx={{
                          mt: 0.75, p: 0.75, borderRadius: 0.75,
                          bgcolor: alpha(theme.palette.error.main, 0.06),
                          border: `1px solid ${alpha(theme.palette.error.main, 0.12)}`,
                        }}
                      >
                        <Typography variant="caption" sx={{ fontSize: 10, color: 'error.dark', lineHeight: 1.5 }}>
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
