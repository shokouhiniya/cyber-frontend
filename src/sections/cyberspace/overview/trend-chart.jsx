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

function getVolumeArrows(prevValue, currValue) {
  if (!prevValue || prevValue <= 0 || currValue <= prevValue) return 0;
  const ratio = currValue / prevValue;
  if (ratio >= 100) return 3;
  if (ratio >= 10) return 2;
  if (ratio >= 2) return 1;
  return 0;
}

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

// Data reflecting actual 324 posts: ~35% positive, ~60% negative, ~5% neutral
const TREND_DATA = {
  '24h': [
    { day: '\u06F0\u06F0', positive: 30, negative: 58, neutral: 12, posts: 18, views: 1240000 },
    { day: '\u06F0\u06F4', positive: 25, negative: 65, neutral: 10, posts: 12, views: 890000 },
    { day: '\u06F0\u06F8', positive: 35, negative: 52, neutral: 13, posts: 28, views: 3450000 },
    { day: '\u06F1\u06F2', positive: 40, negative: 48, neutral: 12, posts: 52, views: 8900000 },
    { day: '\u06F1\u06F6', positive: 38, negative: 50, neutral: 12, posts: 65, views: 12300000 },
    { day: '\u06F2\u06F0', positive: 32, negative: 60, neutral: 8, posts: 89, views: 45600000 },
    { day: '\u06F2\u06F4', positive: 28, negative: 62, neutral: 10, posts: 60, views: 32100000 },
  ],
  '30d': [
    { day: '\u0647\u0641\u062A\u0647 \u06F1', positive: 42, negative: 48, neutral: 10, posts: 1250, views: 89000000 },
    { day: '\u0647\u0641\u062A\u0647 \u06F2', positive: 38, negative: 52, neutral: 10, posts: 980, views: 76000000 },
    { day: '\u0647\u0641\u062A\u0647 \u06F3', positive: 35, negative: 55, neutral: 10, posts: 1420, views: 112000000 },
    { day: '\u0647\u0641\u062A\u0647 \u06F4', positive: 30, negative: 62, neutral: 8, posts: 1350, views: 98000000 },
  ],
  all: [
    { day: '\u0641\u0631\u0648\u0631\u062F\u06CC\u0646', positive: 45, negative: 42, neutral: 13, posts: 5200, views: 380000000 },
    { day: '\u0627\u0631\u062F\u06CC\u0628\u0647\u0634\u062A', positive: 35, negative: 55, neutral: 10, posts: 5800, views: 420000000 },
  ],
  '7d': [
    { day: '\u0634\u0646\u0628\u0647', positive: 40, negative: 48, neutral: 12, posts: 42, views: 12400000 },
    { day: '\u06CC\u06A9\u0634\u0646\u0628\u0647', positive: 38, negative: 52, neutral: 10, posts: 48, views: 15800000 },
    { day: '\u062F\u0648\u0634\u0646\u0628\u0647', positive: 32, negative: 58, neutral: 10, posts: 55, views: 18200000 },
    { day: '\u0633\u0647\u200C\u0634\u0646\u0628\u0647', positive: 35, negative: 55, neutral: 10, posts: 50, views: 24500000 },
    { day: '\u0686\u0647\u0627\u0631\u0634\u0646\u0628\u0647', positive: 30, negative: 60, neutral: 10, posts: 45, views: 19800000 },
    { day: '\u067E\u0646\u062C\u0634\u0646\u0628\u0647', positive: 28, negative: 62, neutral: 10, posts: 42, views: 14200000 },
    { day: '\u062C\u0645\u0639\u0647', positive: 25, negative: 65, neutral: 10, posts: 42, views: 13600000 },
  ],
};

export function TrendChart({ loading }) {
  const theme = useTheme();
  const [timeFilter, setTimeFilter] = useState('7d');

  const timeFilters = [
    { value: '24h', label: '\u06F2\u06F4 \u0633\u0627\u0639\u062A' },
    { value: '7d', label: '\u0647\u0641\u062A\u0647 \u067E\u06CC\u0634' },
    { value: '30d', label: '\u0645\u0627\u0647 \u067E\u06CC\u0634' },
    { value: 'all', label: '\u06A9\u0644 \u0628\u0627\u0632\u0647' },
  ];

  const trendData = TREND_DATA[timeFilter] || TREND_DATA['7d'];
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

  const renderArrows = (count, sentimentDir) => {
    if (count === 0) return null;
    const color = sentimentDir === 'negative' ? NEGATIVE_COLOR : POSITIVE_COLOR;
    return (
      <Typography component="span" sx={{ fontSize: 7, color, fontWeight: 800, lineHeight: 1, letterSpacing: '-1px' }}>
        {'\u25B2'.repeat(count)}
      </Typography>
    );
  };

  return (
    <Card sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: theme.shadows[2] }}>
      <Box sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="solar:chart-2-bold-duotone" width={20} sx={{ color: theme.palette.primary.main }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{'\u0631\u0648\u0646\u062F \u0627\u062D\u0633\u0627\u0633\u0627\u062A'}</Typography>
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
          {timeFilters.map((filter) => (
            <Button key={filter.value} className={timeFilter === filter.value ? 'active' : ''} onClick={() => setTimeFilter(filter.value)}>
              {filter.label}
            </Button>
          ))}
        </ButtonGroup>

        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5 }}>
          {trendData.map((item, index) => {
            const prev = index > 0 ? trendData[index - 1] : null;
            const sentimentDir = getSentimentDirection(prev, item);
            const postArrows = getVolumeArrows(prev?.posts, item.posts);
            const viewArrows = getVolumeArrows(prev?.views, item.views);

            return (
              <Box key={index} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                <Stack spacing={0.5} sx={{ width: '100%', height: 100, justifyContent: 'flex-end' }}>
                  <Box sx={{ width: '100%', height: `${(item.positive / maxValue) * 100}%`, bgcolor: alpha(POSITIVE_COLOR, 0.8), borderRadius: 0.5, transition: 'all 0.3s ease' }} />
                  <Box sx={{ width: '100%', height: `${(item.neutral / maxValue) * 100}%`, bgcolor: alpha(NEUTRAL_COLOR, 0.6), borderRadius: 0.5, transition: 'all 0.3s ease' }} />
                  <Box sx={{ width: '100%', height: `${(item.negative / maxValue) * 100}%`, bgcolor: alpha(NEGATIVE_COLOR, 0.8), borderRadius: 0.5, transition: 'all 0.3s ease' }} />
                </Stack>

                <Typography variant="caption" sx={{ fontSize: 9, color: 'text.primary', fontWeight: 700, textAlign: 'center', minHeight: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {item.day}
                </Typography>

                <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.25} sx={{ minHeight: 14 }}>
                  <Iconify icon="solar:document-text-bold" width={10} sx={{ color: 'text.disabled' }} />
                  <Typography variant="caption" sx={{ fontSize: 8, color: 'text.secondary', fontWeight: 600, lineHeight: 1 }}>
                    {formatNum(item.posts)}
                  </Typography>
                  {renderArrows(postArrows, sentimentDir)}
                </Stack>

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

        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: POSITIVE_COLOR }} />
            <Typography variant="caption" sx={{ fontSize: 10 }}>{'\u0645\u062B\u0628\u062A'}</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: NEUTRAL_COLOR }} />
            <Typography variant="caption" sx={{ fontSize: 10 }}>{'\u062E\u0646\u062B\u06CC'}</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: NEGATIVE_COLOR }} />
            <Typography variant="caption" sx={{ fontSize: 10 }}>{'\u0645\u0646\u0641\u06CC'}</Typography>
          </Stack>
        </Stack>
      </Box>
    </Card>
  );
}
