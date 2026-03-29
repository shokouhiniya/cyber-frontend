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

export function TrendChart({ loading }) {
  const theme = useTheme();
  const [timeFilter, setTimeFilter] = useState('7d');

  const timeFilters = [
    { value: '24h', label: '۲۴ ساعت' },
    { value: '7d', label: 'هفته پیش' },
    { value: '30d', label: 'ماه پیش' },
    { value: 'all', label: 'کل بازه' },
  ];

  // Mock data for different time ranges
  const getTrendData = () => {
    if (timeFilter === '24h') {
      return [
        { day: '۰۰', positive: 45, negative: 25, neutral: 30 },
        { day: '۰۴', positive: 38, negative: 30, neutral: 32 },
        { day: '۰۸', positive: 52, negative: 20, neutral: 28 },
        { day: '۱۲', positive: 60, negative: 18, neutral: 22 },
        { day: '۱۶', positive: 55, negative: 22, neutral: 23 },
        { day: '۲۰', positive: 48, negative: 28, neutral: 24 },
        { day: '۲۴', positive: 42, negative: 30, neutral: 28 },
      ];
    }
    if (timeFilter === '30d') {
      return [
        { day: 'هفته ۱', positive: 50, negative: 28, neutral: 22 },
        { day: 'هفته ۲', positive: 48, negative: 30, neutral: 22 },
        { day: 'هفته ۳', positive: 55, negative: 25, neutral: 20 },
        { day: 'هفته ۴', positive: 52, negative: 27, neutral: 21 },
      ];
    }
    // Default 7d
    return [
      { day: 'شنبه', positive: 45, negative: 25, neutral: 30 },
      { day: 'یکشنبه', positive: 52, negative: 20, neutral: 28 },
      { day: 'دوشنبه', positive: 38, negative: 35, neutral: 27 },
      { day: 'سه‌شنبه', positive: 60, negative: 18, neutral: 22 },
      { day: 'چهارشنبه', positive: 55, negative: 22, neutral: 23 },
      { day: 'پنجشنبه', positive: 48, negative: 28, neutral: 24 },
      { day: 'جمعه', positive: 42, negative: 30, neutral: 28 },
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

  return (
    <Card
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: theme.shadows[2],
      }}
    >
      <Box sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify
              icon="solar:chart-2-bold-duotone"
              width={20}
              sx={{ color: theme.palette.primary.main }}
            />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              روند احساسات
            </Typography>
          </Stack>
        </Stack>

        {/* Time Filter */}
        <ButtonGroup
          variant="outlined"
          size="small"
          sx={{
            width: '100%',
            mb: 2,
            '& .MuiButton-root': {
              flex: 1,
              fontSize: 9,
              fontWeight: 600,
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
            <Button
              key={filter.value}
              className={timeFilter === filter.value ? 'active' : ''}
              onClick={() => setTimeFilter(filter.value)}
            >
              {filter.label}
            </Button>
          ))}
        </ButtonGroup>

        {/* Chart */}
        <Box sx={{ height: 120, display: 'flex', alignItems: 'flex-end', gap: 0.5 }}>
          {trendData.map((item, index) => (
            <Box
              key={index}
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              {/* Bars */}
              <Stack
                spacing={0.5}
                sx={{
                  width: '100%',
                  height: 100,
                  justifyContent: 'flex-end',
                }}
              >
                {/* Positive */}
                <Box
                  sx={{
                    width: '100%',
                    height: `${(item.positive / maxValue) * 100}%`,
                    bgcolor: alpha('#51CF66', 0.8),
                    borderRadius: 0.5,
                    transition: 'all 0.3s ease',
                  }}
                />
                {/* Neutral */}
                <Box
                  sx={{
                    width: '100%',
                    height: `${(item.neutral / maxValue) * 100}%`,
                    bgcolor: alpha('#ADB5BD', 0.6),
                    borderRadius: 0.5,
                    transition: 'all 0.3s ease',
                  }}
                />
                {/* Negative */}
                <Box
                  sx={{
                    width: '100%',
                    height: `${(item.negative / maxValue) * 100}%`,
                    bgcolor: alpha('#FF6B6B', 0.8),
                    borderRadius: 0.5,
                    transition: 'all 0.3s ease',
                  }}
                />
              </Stack>

              {/* Day label */}
              <Typography
                variant="caption"
                sx={{
                  fontSize: 9,
                  color: 'text.primary',
                  fontWeight: 700,
                  textAlign: 'center',
                  minHeight: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {item.day}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Legend */}
        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#51CF66' }} />
            <Typography variant="caption" sx={{ fontSize: 10 }}>
              مثبت
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ADB5BD' }} />
            <Typography variant="caption" sx={{ fontSize: 10 }}>
              خنثی
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#FF6B6B' }} />
            <Typography variant="caption" sx={{ fontSize: 10 }}>
              منفی
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </Card>
  );
}
