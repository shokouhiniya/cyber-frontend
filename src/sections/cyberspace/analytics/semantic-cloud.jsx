'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ButtonGroup from '@mui/material/ButtonGroup';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const getSizeStyles = (size) => {
  switch (size) {
    case 'xl': return { fontSize: 20, height: 36, px: 2.5 };
    case 'lg': return { fontSize: 17, height: 32, px: 2 };
    case 'md': return { fontSize: 14, height: 28, px: 1.5 };
    case 'sm': return { fontSize: 12, height: 24, px: 1.25 };
    default:   return { fontSize: 10, height: 20, px: 1 };
  }
};

const getSentimentColor = (sentiment, theme) => {
  switch (sentiment) {
    case 'positive': return { bg: alpha('#51CF66', 0.12), border: alpha('#51CF66', 0.24), text: '#51CF66' };
    case 'negative': return { bg: alpha('#FF6B6B', 0.12), border: alpha('#FF6B6B', 0.24), text: '#FF6B6B' };
    default: return {
      bg: alpha(theme.palette.grey[500], 0.08),
      border: alpha(theme.palette.grey[500], 0.16),
      text: theme.palette.text.secondary,
    };
  }
};

/**
 * Semantic word cloud.
 * Accepts a `words` prop: [{ text, value, percent, size, sentiment }]
 * Size values: 'xl' | 'lg' | 'md' | 'sm' | 'xs'
 */
export function SemanticCloud({ words = [], loading }) {
  const theme = useTheme();
  const [timeFilter, setTimeFilter] = useState('7d');

  const timeFilters = [
    { value: '24h', label: '۲۴ ساعت' },
    { value: '7d',  label: 'هفته پیش' },
    { value: '30d', label: 'ماه پیش' },
    { value: 'all', label: 'کل بازه' },
  ];

  if (loading) {
    return (
      <Card sx={{ p: 2.5, borderRadius: 2.5, boxShadow: theme.shadows[2], display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 100 }}>
        <CircularProgress size={24} />
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: 2.5, overflow: 'hidden', boxShadow: theme.shadows[2] }}>
      <Box
        sx={{
          p: 2,
          background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.08)} 0%, ${alpha(theme.palette.error.main, 0.08)} 100%)`,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ width: 40, height: 40, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.success.main, 0.16) }}>
            <Iconify icon="solar:cloud-bold-duotone" width={24} sx={{ color: theme.palette.success.main }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>ابر واژگان هوشمند</Typography>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ p: 2 }}>
        <ButtonGroup
          variant="outlined"
          size="small"
          sx={{
            width: '100%', mb: 2,
            '& .MuiButton-root': {
              flex: 1, fontSize: 9, fontWeight: 600,
              borderColor: alpha(theme.palette.primary.main, 0.16),
              color: 'text.secondary',
              '&.active': { bgcolor: alpha(theme.palette.primary.main, 0.12), borderColor: theme.palette.primary.main, color: theme.palette.primary.main, fontWeight: 700 },
            },
          }}
        >
          {timeFilters.map((filter) => (
            <Button key={filter.value} className={timeFilter === filter.value ? 'active' : ''} onClick={() => setTimeFilter(filter.value)}>
              {filter.label}
            </Button>
          ))}
        </ButtonGroup>

        <Box
          sx={{
            minHeight: 200, display: 'flex', flexWrap: 'wrap', gap: 1,
            justifyContent: 'center', alignItems: 'center', p: 2,
            bgcolor: alpha(theme.palette.grey[500], 0.04), borderRadius: 2,
          }}
        >
          {words.length === 0 ? (
            <Stack alignItems="center" spacing={1}>
              <Iconify icon="solar:cloud-bold-duotone" width={36} sx={{ color: 'text.disabled' }} />
              <Typography variant="body2" color="text.secondary">داده‌ای موجود نیست.</Typography>
            </Stack>
          ) : (
            words.map((word, index) => {
              const colors = getSentimentColor(word.sentiment, theme);
              return (
                <Chip
                  key={index}
                  label={
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <span>{word.text}</span>
                      <Box component="span" sx={{ fontSize: '0.75em', opacity: 0.7, fontWeight: 600 }}>{word.percent}%</Box>
                    </Stack>
                  }
                  sx={{
                    ...getSizeStyles(word.size),
                    bgcolor: colors.bg, border: `1px solid ${colors.border}`, color: colors.text,
                    fontWeight: 700, transition: 'all 0.2s ease',
                    '&:hover': { transform: 'scale(1.05)', boxShadow: `0 4px 12px ${colors.border}` },
                  }}
                />
              );
            })
          )}
        </Box>

        <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 10, display: 'block', textAlign: 'center', mt: 1.5 }}>
          اندازه هر واژه نشان‌دهنده تکرار آن در محتواست
        </Typography>
      </Box>
    </Card>
  );
}
