import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { useSourceStats } from 'src/api/dashboard';

import { Iconify } from 'src/components/iconify';
import { SvgColor } from 'src/components/svg-color';
// ----------------------------------------------------------------------
// Same 4-row layout as the منابع section in /data-sources/ search panel

const SOURCE_ROWS = [
  [
    { key: 'twitter',   label: 'ایکس',                icon: 'ri:twitter-x-fill',                    color: '#000000' },
    { key: 'instagram', label: 'اینستاگرام',          icon: 'mdi:instagram',                         color: '#E4405F' },
    { key: 'telegram',  label: 'تلگرام',               icon: 'ic:baseline-telegram',                  color: '#0088cc' },
  ],
  [
    { key: 'news',      label: 'خبرگزاری',            icon: 'solar:document-text-bold',              color: '#4CAF50' },
    { key: 'newspaper', label: 'روزنامه',              icon: 'solar:global-bold-duotone',             color: '#78909C' },
    { key: 'media',     label: 'صدا و سیما',          icon: 'solar:tv-bold-duotone',                 color: '#FF5722' },
  ],
  [
    { key: 'eitaa',     label: 'ایتا',                svg: '/assets/icons/social/eitaa-mono.svg',    color: '#F57C00' },
    { key: 'rubika',    label: 'روبیکا',               svg: '/assets/icons/social/rubika-mono.svg',   color: '#7C3AED' },
    { key: 'bale',      label: 'بله',                  svg: '/assets/icons/social/bale-mono.svg',     color: '#00A86B' },
  ],
  [
    { key: 'comments',  label: 'کامنت‌ها',             icon: 'solar:chat-line-bold-duotone',          color: '#ADB5BD', disabled: true },
    { key: 'forum',     label: 'فروم',                 icon: 'solar:chat-square-bold-duotone',        color: '#795548' },
    { key: 'aparat',    label: 'پلتفرم‌های ویدئویی',   icon: 'solar:videocamera-record-bold-duotone', color: '#FF5722' },
  ],
];

const TIMEFRAMES = [
  { value: 'day',     label: 'امروز'   },
  { value: 'week',    label: '۷ روز'   },
  { value: 'month',   label: '۳۰ روز'  },
  { value: 'quarter', label: 'فصل'     },
];


const formatNum = (n) => {
  if (!n) return '۰';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  return n.toLocaleString('fa-IR');
};

// ----------------------------------------------------------------------

function SourcePill({ source, count, onClick, active }) {
  const theme = useTheme();
  const hasData = count > 0;
  const color = source.color;

  return (
    <Box
      onClick={source.disabled ? undefined : onClick}
      sx={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 0.5, p: 1, borderRadius: 1.5, flex: 1,
        cursor: source.disabled ? 'not-allowed' : onClick ? 'pointer' : 'default',
        border: `1.5px solid ${active ? color : alpha(theme.palette.grey[500], 0.2)}`,
        bgcolor: active ? alpha(color, 0.1) : hasData ? alpha(color, 0.04) : alpha(theme.palette.grey[500], 0.03),
        opacity: source.disabled ? 0.35 : hasData ? 1 : 0.5,
        transition: 'all 0.15s',
        minWidth: 56,
        '&:hover': (source.disabled || !onClick) ? {} : {
          bgcolor: alpha(color, active ? 0.14 : 0.08),
          borderColor: color,
        },
      }}
    >
      {/* Icon */}
      <Box sx={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {source.svg ? (
          <SvgColor src={source.svg} sx={{ width: 20, height: 20, color: active || hasData ? color : 'text.disabled' }} />
        ) : (
          <Iconify icon={source.icon} width={20} sx={{ color: active || hasData ? color : 'text.disabled' }} />
        )}
      </Box>

      {/* Count */}
      <Typography
        variant="caption"
        sx={{ fontWeight: 800, color: hasData ? color : 'text.disabled', fontSize: 13, lineHeight: 1 }}
      >
        {source.disabled ? '—' : formatNum(count)}
      </Typography>
    </Box>
  );
}

// ----------------------------------------------------------------------

export function PlatformSummary({ onPlatformFilter, activePlatform }) {
  const theme = useTheme();
  const [timeframe, setTimeframe] = useState('week');

  const tf = TIMEFRAMES.find((t) => t.value === timeframe);

  const { data: sources = [], isLoading } = useSourceStats(tf?.value || 'week');

  // Build a lookup: source key → stats
  const statsMap = {};
  for (const s of sources) statsMap[s.source] = s;

  const totalPosts = sources.reduce((sum, s) => sum + (s.count || 0), 0);

  return (
    <Card sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: theme.shadows[2] }}>
      <Box sx={{ p: 2 }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="solar:widget-5-bold-duotone" width={20} sx={{ color: theme.palette.primary.main }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>خلاصه پلتفرم‌ها</Typography>
            {!isLoading && totalPosts > 0 && (
              <Chip
                size="small"
                label={`${totalPosts.toLocaleString('fa-IR')} پست`}
                variant="outlined"
                color="primary"
                sx={{ fontSize: 10, height: 20 }}
              />
            )}
          </Stack>

          {/* Timeframe chips */}
          <Stack direction="row" spacing={0.5}>
            {TIMEFRAMES.map((t) => (
              <Chip
                key={t.value}
                size="small"
                label={t.label}
                onClick={() => setTimeframe(t.value)}
                variant={timeframe === t.value ? 'filled' : 'outlined'}
                color={timeframe === t.value ? 'primary' : 'default'}
                sx={{ fontSize: 10, height: 22, cursor: 'pointer' }}
              />
            ))}
          </Stack>
        </Stack>

        {/* Loading indicator — small spinner in header, grid stays visible */}
        {isLoading && (
          <Box sx={{ position: 'absolute', top: 12, left: 12 }}>
            <CircularProgress size={14} thickness={5} />
          </Box>
        )}

        {/* Source grid — always rendered, dimmed while loading */}
        <Stack spacing={0.75} sx={{ opacity: isLoading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
          {SOURCE_ROWS.map((row, ri) => (
            <Stack key={ri} direction="row" spacing={0.75}>
              {row.map((src) => {
                const stat = statsMap[src.key] || { count: 0 };
                return (
                  <SourcePill
                    key={src.key}
                    source={src}
                    count={stat.count || 0}
                    active={activePlatform === src.key}
                    onClick={onPlatformFilter ? () => onPlatformFilter(src.key) : undefined}
                  />
                );
              })}
            </Stack>
          ))}
        </Stack>

        {!isLoading && totalPosts === 0 && (
          <Box sx={{ py: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">داده‌ای در این بازه زمانی موجود نیست.</Typography>
          </Box>
        )}
      </Box>
    </Card>
  );
}
