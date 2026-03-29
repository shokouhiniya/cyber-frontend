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

const statsConfig = [
  {
    key: 'totalPosts',
    title: 'تعداد پست‌ها',
    subtitle: 'کل محتوای منتشر شده',
    icon: 'solar:document-text-bold-duotone',
    color: '#667eea',
  },
  {
    key: 'totalViews',
    title: 'بازدید کل',
    subtitle: 'تعداد نمایش محتوا',
    icon: 'solar:eye-bold-duotone',
    color: '#f5576c',
  },
  {
    key: 'totalLikes',
    title: 'لایک‌ها',
    subtitle: 'واکنش مثبت کاربران',
    icon: 'solar:heart-bold-duotone',
    color: '#00f2fe',
  },
  {
    key: 'totalRetweets',
    title: 'ریتوییت‌ها',
    subtitle: 'اشتراک‌گذاری محتوا',
    icon: 'solar:reorder-bold-duotone',
    color: '#38f9d7',
  },
];

export function StatsGrid({ stats, loading }) {
  const theme = useTheme();
  const [timeFilter, setTimeFilter] = useState('24h');

  const timeFilters = [
    { value: '24h', label: '۲۴ ساعت' },
    { value: '7d', label: 'هفته پیش' },
    { value: '30d', label: 'ماه پیش' },
    { value: 'all', label: 'کل بازه' },
  ];

  return (
    <Stack spacing={1.5}>
      {/* Time Filter */}
      <ButtonGroup
        variant="outlined"
        size="small"
        sx={{
          width: '100%',
          '& .MuiButton-root': {
            flex: 1,
            fontSize: 10,
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
      {/* Stats Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 1.5,
        }}
      >
      {statsConfig.map((config) => (
        <Card
          key={config.key}
          sx={{
            position: 'relative',
            borderRadius: 2,
            p: 2,
            overflow: 'hidden',
            boxShadow: theme.shadows[4],
            border: `1px solid ${alpha(config.color, 0.12)}`,
            background: `linear-gradient(135deg, ${alpha(config.color, 0.08)} 0%, ${alpha(config.color, 0.02)} 100%)`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: theme.shadows[8],
              borderColor: alpha(config.color, 0.24),
            },
          }}
        >
          <Stack spacing={1.5} alignItems="center" textAlign="center">
            {/* Icon */}
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(config.color, 0.16),
              }}
            >
              <Iconify icon={config.icon} width={28} sx={{ color: config.color }} />
            </Box>

            {/* Value */}
            {loading ? (
              <CircularProgress size={20} sx={{ color: config.color }} />
            ) : (
              <Typography
                variant="h5"
                sx={{
                  color: 'text.primary',
                  fontWeight: 800,
                  lineHeight: 1,
                }}
              >
                {stats[config.key]?.toLocaleString('fa-IR') || '۰'}
              </Typography>
            )}

            {/* Title */}
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontWeight: 600,
                fontSize: 11,
              }}
            >
              {config.title}
            </Typography>
          </Stack>

          {/* Decorative element */}
          <Box
            sx={{
              position: 'absolute',
              top: -10,
              right: -10,
              width: 60,
              height: 60,
              borderRadius: '50%',
              bgcolor: alpha(config.color, 0.04),
              pointerEvents: 'none',
            }}
          />
        </Card>
      ))}
      </Box>
    </Stack>
  );
}
