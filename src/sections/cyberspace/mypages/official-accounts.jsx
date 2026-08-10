'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { useProfile } from 'src/api/dashboard';

import { Iconify } from 'src/components/iconify';
import { InfoTooltip } from 'src/components/info-tooltip';
import { WIDGET_TOOLTIPS } from 'src/components/info-tooltip/widget-tooltips';

import { PlatformIcon } from './platform-icon';
import { platformById, getPlatformUrl } from './platform-config';

// ----------------------------------------------------------------------

const formatNum = (n) => {
  if (n == null) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toLocaleString('fa-IR');
};

export function OfficialAccounts() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { data: profile, isLoading } = useProfile();
  const channels = profile?.officialChannels ?? [];

  const activeCount = channels.filter((c) => c.active !== false).length;
  const totalFollowers = channels.reduce((s, c) => s + (c.followers || 0), 0);
  const totalPosts = channels.reduce((s, c) => s + (c.posts || 0), 0);

  if (isLoading) {
    return (
      <Card sx={{ p: 3, borderRadius: 2.5 }}>
        <Typography color="text.secondary">در حال بارگذاری صفحات رسمی...</Typography>
      </Card>
    );
  }

  if (channels.length === 0) {
    return (
      <Card sx={{ p: 3, borderRadius: 2.5 }}>
        <Stack alignItems="center" spacing={1} sx={{ py: 2 }}>
          <Iconify icon="solar:shield-check-bold-duotone" width={40} sx={{ color: 'text.disabled' }} />
          <Typography color="text.secondary" variant="body2">
            هنوز صفحه رسمی تعریف نشده است.
          </Typography>
          <Typography color="text.disabled" variant="caption">
            از پنل مدیریت → پروفایل‌ها → ویرایش، صفحات رسمی را اضافه کنید.
          </Typography>
        </Stack>
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: 2.5, overflow: 'hidden', boxShadow: theme.shadows[2] }}>
      {/* Header */}
      <Box
        sx={{
          p: 2.5,
          background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.08)} 100%)`,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 40, height: 40, borderRadius: 1.5,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: alpha(theme.palette.info.main, 0.16),
            }}
          >
            <Iconify icon="solar:shield-check-bold-duotone" width={24} sx={{ color: theme.palette.info.main }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>صفحات رسمی</Typography>
            <InfoTooltip title={WIDGET_TOOLTIPS.officialAccounts} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {activeCount.toLocaleString('fa-IR')} حساب فعال
              {totalFollowers > 0 && ` · ${formatNum(totalFollowers)} دنبال‌کننده`}
              {totalPosts > 0 && ` · ${formatNum(totalPosts)} انتشار`}
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Channel cards */}
      <Box
        sx={{
          p: 2,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          gap: 1.5,
        }}
      >
        {channels.map((ch, idx) => {
          const cfg = platformById[ch.platform] ?? {
            label: ch.platform,
            iconType: 'iconify',
            icon: 'solar:global-bold-duotone',
            color: '#607D8B',
          };
          const isActive = ch.active !== false;
          const href = getPlatformUrl(ch);

          return (
            <Box
              key={idx}
              component={href ? Link : 'div'}
              href={href || undefined}
              target="_blank"
              rel="noopener noreferrer"
              underline="none"
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(cfg.color, isDark ? 0.08 : 0.04),
                border: `1px solid ${alpha(cfg.color, isDark ? 0.24 : 0.12)}`,
                opacity: isActive ? 1 : 0.5,
                transition: 'all 0.2s ease',
                cursor: href ? 'pointer' : 'default',
                '&:hover': href
                  ? {
                      bgcolor: alpha(cfg.color, isDark ? 0.14 : 0.08),
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[4],
                    }
                  : undefined,
              }}
            >
              <Stack spacing={1.5}>
                {/* Platform + status */}
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box
                      sx={{
                        width: 32, height: 32, borderRadius: 1,
                        bgcolor: alpha(cfg.color, 0.16),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <PlatformIcon cfg={cfg} size={18} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 12, display: 'block', lineHeight: 1.2 }}>
                        {cfg.label}
                      </Typography>
                      <Typography
                        variant="caption"
                        noWrap
                        sx={{ color: 'text.secondary', fontSize: 10, direction: 'ltr', display: 'block' }}
                      >
                        {ch.handle}
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={0.5} alignItems="center" flexShrink={0}>
                    {ch.verified && (
                      <Iconify icon="solar:verified-check-bold" width={16} sx={{ color: '#1DA1F2' }} />
                    )}
                    <Chip
                      label={isActive ? 'فعال' : 'غیرفعال'}
                      size="small"
                      sx={{
                        height: 20, fontSize: 9, fontWeight: 700,
                        bgcolor: isActive ? alpha('#51CF66', 0.12) : alpha('#FF6B6B', 0.12),
                        color: isActive ? '#51CF66' : '#FF6B6B',
                      }}
                    />
                  </Stack>
                </Stack>

                {/* Stats */}
                {(ch.followers != null || ch.posts != null) && (
                  <Stack direction="row" spacing={2}>
                    {ch.followers != null && (
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 9, display: 'block' }}>دنبال‌کننده</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, fontSize: 14, color: cfg.color }}>
                          {formatNum(ch.followers)}
                        </Typography>
                      </Box>
                    )}
                    {ch.posts != null && (
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 9, display: 'block' }}>انتشار</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, fontSize: 14, color: 'text.primary' }}>
                          {formatNum(ch.posts)}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                )}
              </Stack>
            </Box>
          );
        })}
      </Box>
    </Card>
  );
}
