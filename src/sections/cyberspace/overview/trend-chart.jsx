import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ButtonGroup from '@mui/material/ButtonGroup';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const POSITIVE_COLOR = '#51CF66';
const NEGATIVE_COLOR = '#FF6B6B';
const NEUTRAL_COLOR = '#ADB5BD';

// Volume spike: how many upward arrows based on increase ratio.
// Only triggers on increases. Returns 0-3.
// 1 arrow = ~2x increase, 2 arrows = ~10x, 3 arrows = ~100x+
function getVolumeArrows(prevValue, currValue) {
  if (!prevValue || prevValue <= 0 || currValue <= prevValue) return 0;
  const ratio = currValue / prevValue;
  if (ratio >= 100) return 3;
  if (ratio >= 10) return 2;
  if (ratio >= 2) return 1;
  return 0;
}

// Sentiment direction: did positive ratio go up or down?
// Returns 'positive' | 'negative' | null
function getSentimentDirection(prev, curr) {
  if (!prev) return null;
  const prevTotal = prev.positive + prev.negative + prev.neutral;
  const currTotal = curr.positive + curr.negative + curr.neutral;
  if (prevTotal === 0 || currTotal === 0) return null;
  const diff = (curr.positive / currTotal) - (prev.positive / prevTotal);
  if (diff > 0.01) return 'positive';
  if (diff < -0.01) return 'negative';
  return null;
}

export function TrendChart({ loading }) {
  const theme = useTheme();
  const [timeFilter, setTimeFilter] = useState('7d');

  const timeFilters = [
    { value: '24h', label: '۲۴ ساعت' },
    { value: '7d', label: 'هفته پیش' },
    { value: '30d', label: 'ماه پیش' },
    { value: 'all', label: 'کل بازه' },
  ];

  const getTrendData = () => {
    if (timeFilter === '24h') {
      return [
        { day: '۰۰', positive: 45, negative: 25, neutral: 30, posts: 120, views: 4500 },
        { day: '۰۴', positive: 38, negative: 30, neutral: 32, posts: 85, views: 3200 },
        { day: '۰۸', positive: 52, negative: 20, neutral: 28, posts: 210, views: 9800 },
        { day: '۱۲', positive: 60, negative: 18, neutral: 22, posts: 340, views: 18500 },
        { day: '۱۶', positive: 55, negative: 22, neutral: 23, posts: 290, views: 15200 },
        { day: '۲۰', positive: 48, negative: 28, neutral: 24, posts: 180, views: 8700 },
        { day: '۲۴', positive: 42, negative: 30, neutral: 28, posts: 95, views: 4100 },
      ];
    }
    if (timeFilter === '30d') {
      return [
        { day: 'هفته ۱', positive: 50, negative: 28, neutral: 22, posts: 1250, views: 89000 },
        { day: 'هفته ۲', positive: 48, negative: 30, neutral: 22, posts: 1180, views: 76000 },
        { day: 'هفته ۳', positive: 55, negative: 25, neutral: 20, posts: 1420, views: 112000 },
        { day: 'هفته ۴', positive: 52, negative: 27, neutral: 21, posts: 1350, views: 98000 },
      ];
    }
    if (timeFilter === 'all') {
      return [
        { day: 'فروردین', positive: 48, negative: 30, neutral: 22, posts: 5200, views: 380000 },
        { day: 'اردیبهشت', positive: 52, negative: 25, neutral: 23, posts: 5800, views: 420000 },
        { day: 'خرداد', positive: 45, negative: 32, neutral: 23, posts: 4900, views: 350000 },
        { day: 'تیر', positive: 58, negative: 20, neutral: 22, posts: 6100, views: 490000 },
      ];
    }
    return [
      { day: 'شنبه', positive: 45, negative: 25, neutral: 30, posts: 180, views: 12400 },
      { day: 'یکشنبه', positive: 52, negative: 20, neutral: 28, posts: 210, views: 15800 },
      { day: 'دوشنبه', positive: 38, negative: 35, neutral: 27, posts: 165, views: 11200 },
      { day: 'سه‌شنبه', positive: 60, negative: 18, neutral: 22, posts: 290, views: 24500 },
      { day: 'چهارشنبه', positive: 55, negative: 22, neutral: 23, posts: 245, views: 19800 },
      { day: 'پنجشنبه', positive: 48, negative: 28, neutral: 24, posts: 195, views: 14200 },
      { day: 'جمعه', positive: 42, negative: 30, neutral: 28, posts: 140, views: 9600 },
    ];
  };

  const trendData = getTrendData();
  const maxValue = 100;

  if (loading) {
    return (
      <Card sx={{ p: 2, borderRadius: 2, boxShadow: theme.shadows[2] }}>
        <CircularProgress size={24} />
      </Card>
    );
  }

  const formatNum = (n) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
    return n.toLocaleString('fa-IR');
  };

  // Render upward arrows: always ▲, count based on volume spike, color based on sentiment change
  const renderArrows = (count, sentimentDir) => {
    if (count === 0) return null;
    const color = sentimentDir === 'negative' ? NEGATIVE_COLOR : POSITIVE_COLOR;
    return (
      <Typography component="span" sx={{ fontSize: 7, color, fontWeight: 800, lineHeight: 1, letterSpacing: '-1px' }}>
        {'▲'.repeat(count)}
      </Typography>
    );
  };

  return (
    <Card sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: theme.shadows[2] }}>
      <Box sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="solar:chart-2-bold-duotone" width={20} sx={{ color: theme.palette.primary.main }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>روند احساسات</Typography>
          </Stack>
        </Stack>

        {/* Time Filter */}
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
          {timeFilters.map((filter) => (
            <Button key={filter.value} className={timeFilter === filter.value ? 'active' : ''} onClick={() => setTimeFilter(filter.value)}>
              {filter.label}
            </Button>
          ))}
        </ButtonGroup>

        {/* Chart */}
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5 }}>
          {trendData.map((item, index) => {
            const prev = index > 0 ? trendData[index - 1] : null;
            const sentimentDir = getSentimentDirection(prev, item);
            const postArrows = getVolumeArrows(prev?.posts, item.posts);
            const viewArrows = getVolumeArrows(prev?.views, item.views);

            return (
              <Box key={index} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                {/* Bars */}
                <Stack spacing={0.5} sx={{ width: '100%', height: 100, justifyContent: 'flex-end' }}>
                  <Box sx={{ width: '100%', height: `${(item.positive / maxValue) * 100}%`, bgcolor: alpha(POSITIVE_COLOR, 0.8), borderRadius: 0.5, transition: 'all 0.3s ease' }} />
                  <Box sx={{ width: '100%', height: `${(item.neutral / maxValue) * 100}%`, bgcolor: alpha(NEUTRAL_COLOR, 0.6), borderRadius: 0.5, transition: 'all 0.3s ease' }} />
                  <Box sx={{ width: '100%', height: `${(item.negative / maxValue) * 100}%`, bgcolor: alpha(NEGATIVE_COLOR, 0.8), borderRadius: 0.5, transition: 'all 0.3s ease' }} />
                </Stack>

                {/* Day label */}
                <Typography variant="caption" sx={{ fontSize: 9, color: 'text.primary', fontWeight: 700, textAlign: 'center', minHeight: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {item.day}
                </Typography>

                {/* Posts count + volume spike arrows */}
                <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.25} sx={{ minHeight: 14 }}>
                  <Iconify icon="solar:document-text-bold" width={10} sx={{ color: 'text.disabled' }} />
                  <Typography variant="caption" sx={{ fontSize: 8, color: 'text.secondary', fontWeight: 600, lineHeight: 1 }}>
                    {formatNum(item.posts)}
                  </Typography>
                  {renderArrows(postArrows, sentimentDir)}
                </Stack>

                {/* Views count + volume spike arrows */}
                <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.25} sx={{ minHeight: 14 }}>
                  <Iconify icon="solar:eye-bold" width={10} sx={{ color: 'text.disabled' }} />
                  <Typography variant="caption" sx={{ fontSize: 8, color: 'text.secondary', fontWeight: 600, lineHeight: 1 }}>
                    {formatNum(item.views)}
                  </Typography>
                  {renderArrows(viewArrows, sentimentDir)}
                </Stack>
              </Box>
            );
          })}
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
      </Box>
    </Card>
  );
}
