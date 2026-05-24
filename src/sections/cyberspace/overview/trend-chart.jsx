import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ButtonGroup from '@mui/material/ButtonGroup';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { useProfile, useTrendData } from 'src/api/dashboard';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const POSITIVE_COLOR = '#51CF66';
const NEGATIVE_COLOR = '#FF6B6B';
const NEUTRAL_COLOR = '#ADB5BD';

const TIME_FILTERS = [
  { value: '7d',  label: '۷ روز',  hours: 168 },
  { value: '30d', label: '۳۰ روز', hours: 720 },
];

const formatNum = (n) => {
  if (!n) return '۰';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  return n.toLocaleString('fa-IR');
};

// ── Main component ────────────────────────────────────────────────────────────

export function TrendChart({ loading: parentLoading }) {
  const theme = useTheme();
  const [timeFilter, setTimeFilter] = useState('7d');

  const { data: profile } = useProfile();
  const tf = TIME_FILTERS.find((f) => f.value === timeFilter);
  const { data: trendRaw, isLoading } = useTrendData(profile?.id, tf?.hours || 168);

  const loading = parentLoading || isLoading;

  // Shape trend data into chart points
  const trendPoints = (trendRaw?.trend || []).map((pt) => ({
    day: new Date(pt.hour).toLocaleDateString('fa-IR', { month: 'numeric', day: 'numeric' }),
    positive: pt.positiveCount || 0,
    negative: pt.negativeCount || 0,
    neutral: pt.neutralCount || 0,
    posts: pt.postCount || 0,
    views: pt.totalViews || 0,
  }));

  // For 30d, aggregate by day (group hourly points by date)
  const chartData = timeFilter === '30d' ? aggregateByDay(trendPoints) : trendPoints;

  const maxValue = Math.max(
    ...chartData.map((d) => d.positive + d.negative + d.neutral),
    1,
  );

  if (loading) {
    return (
      <Card sx={{ p: 2, borderRadius: 2, boxShadow: theme.shadows[2], display: 'flex', justifyContent: 'center', minHeight: 100 }}>
        <CircularProgress size={24} />
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: theme.shadows[2] }}>
      <Box sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="solar:chart-2-bold-duotone" width={20} sx={{ color: theme.palette.primary.main }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>روند احساسات</Typography>
          </Stack>
        </Stack>

        <ButtonGroup
          variant="outlined"
          size="small"
          sx={{
            width: '100%', mb: 2,
            '& .MuiButton-root': {
              flex: 1, fontSize: 9, fontWeight: 600,
              borderColor: alpha(theme.palette.primary.main, 0.16),
              color: 'text.secondary',
              '&.active': {
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
                fontWeight: 700,
              },
            },
          }}
        >
          {TIME_FILTERS.map((filter) => (
            <Button key={filter.value} className={timeFilter === filter.value ? 'active' : ''} onClick={() => setTimeFilter(filter.value)}>
              {filter.label}
            </Button>
          ))}
        </ButtonGroup>

        {chartData.length === 0 ? (
          <Box sx={{ width: '100%', py: 4, textAlign: 'center' }}>
            <Iconify icon="solar:chart-2-bold-duotone" width={36} sx={{ color: 'text.disabled', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">داده‌ای برای نمایش وجود ندارد.</Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5, height: 100 }}>
              {chartData.map((item, index) => {
                const total = item.positive + item.negative + item.neutral;
                const posH = maxValue > 0 ? (item.positive / maxValue) * 100 : 0;
                const neuH = maxValue > 0 ? (item.neutral / maxValue) * 100 : 0;
                const negH = maxValue > 0 ? (item.negative / maxValue) * 100 : 0;

                return (
                  <Box key={index} sx={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                    {posH > 0 && <Box sx={{ width: '100%', height: `${posH}%`, bgcolor: alpha(POSITIVE_COLOR, 0.8), borderRadius: '2px 2px 0 0' }} />}
                    {neuH > 0 && <Box sx={{ width: '100%', height: `${neuH}%`, bgcolor: alpha(NEUTRAL_COLOR, 0.5), borderRadius: posH > 0 ? 0 : '2px 2px 0 0' }} />}
                    {negH > 0 && <Box sx={{ width: '100%', height: `${negH}%`, bgcolor: alpha(NEGATIVE_COLOR, 0.8), borderRadius: (posH > 0 || neuH > 0) ? '0 0 2px 2px' : '2px' }} />}
                  </Box>
                );
              })}
            </Box>

            {/* X-axis labels */}
            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
              {chartData.map((item, index) => (
                <Box key={index} sx={{ flex: 1, textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ fontSize: 8, color: 'text.secondary', fontWeight: 600 }}>
                    {item.day}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Legend */}
            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: POSITIVE_COLOR }} />
                <Typography variant="caption" sx={{ fontSize: 10 }}>مثبت</Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: NEUTRAL_COLOR }} />
                <Typography variant="caption" sx={{ fontSize: 10 }}>خنثی</Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: NEGATIVE_COLOR }} />
                <Typography variant="caption" sx={{ fontSize: 10 }}>منفی</Typography>
              </Stack>
            </Stack>
          </>
        )}
      </Box>
    </Card>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function aggregateByDay(points) {
  const byDay = new Map();
  for (const pt of points) {
    if (!byDay.has(pt.day)) {
      byDay.set(pt.day, { day: pt.day, positive: 0, negative: 0, neutral: 0, posts: 0, views: 0 });
    }
    const d = byDay.get(pt.day);
    d.positive += pt.positive;
    d.negative += pt.negative;
    d.neutral  += pt.neutral;
    d.posts    += pt.posts;
    d.views    += pt.views;
  }
  return Array.from(byDay.values());
}
