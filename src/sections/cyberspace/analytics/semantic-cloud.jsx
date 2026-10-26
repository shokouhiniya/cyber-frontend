'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { fNum, toFaDigits } from 'src/utils/format-number-fa';

import { useHashtags } from 'src/api/dashboard';

import { WIDGET_TOOLTIPS } from 'src/components/info-tooltip/widget-tooltips';

import { WidgetCard, WidgetToggle } from '../shared/widget-card';

// ----------------------------------------------------------------------

const TIME_FILTERS = [
  { value: '24h', label: '۲۴ ساعت' },
  { value: '7d', label: '۷ روز' },
  { value: '30d', label: '۳۰ روز' },
  { value: 'all', label: 'همه' },
];

const TIMEFRAME_LABEL = {
  '24h': '۲۴ ساعت گذشته',
  '7d': '۷ روز گذشته',
  '30d': '۳۰ روز گذشته',
  all: 'کل بازه',
};

// Font size steps (px) by frequency relative to the most frequent word.
function sizeFor(ratio) {
  if (ratio > 0.8) return 22;
  if (ratio > 0.6) return 19;
  if (ratio > 0.4) return 16;
  if (ratio > 0.2) return 14;
  return 13;
}

/**
 * Word cloud of the most frequent topics / hashtags for the selected period.
 * Size and colour strength show frequency only; the data carries no sentiment.
 */
export function SemanticCloud({ limit = 30 }) {
  const theme = useTheme();
  const [timeframe, setTimeframe] = useState('7d');
  const { data, isLoading } = useHashtags(limit, timeframe);

  const hashtags = Array.isArray(data) ? data : [];
  const maxCount = Math.max(1, ...hashtags.map((h) => h.count || 0));
  const words = hashtags.map((h) => {
    const ratio = (h.count || 0) / maxCount;
    return { text: h.label, count: h.count || 0, ratio, fontSize: sizeFor(ratio) };
  });

  const toggle = <WidgetToggle value={timeframe} onChange={setTimeframe} options={TIME_FILTERS} />;
  const tone = theme.palette.primary.main;
  const isDark = theme.palette.mode === 'dark';

  return (
    <WidgetCard
      title="ابر واژگان"
      icon="solar:cloud-bold-duotone"
      color="success"
      tooltip={WIDGET_TOOLTIPS.semanticCloud}
      subheader={`پرتکرارترین واژه‌ها و هشتگ‌ها · ${TIMEFRAME_LABEL[timeframe]}`}
      action={<Box sx={{ display: { xs: 'none', sm: 'block' } }}>{toggle}</Box>}
      contentSx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      <Box sx={{ display: { xs: 'flex', sm: 'none' }, justifyContent: 'center' }}>{toggle}</Box>

      <WidgetCard
        // Inner, header-less card only for the shared loading / empty states.
        sx={{ border: 0, boxShadow: 'none', bgcolor: 'transparent', borderRadius: 0 }}
        contentSx={{ p: 0 }}
        loading={isLoading}
        empty={!words.length}
        emptyIcon="solar:cloud-bold-duotone"
        emptyText="در این بازه واژه پرتکراری ثبت نشده است."
      >
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: { xs: 1, md: 1.25 },
            py: 1,
          }}
        >
          {words.map((word) => (
            <Tooltip key={word.text} title={`${fNum(word.count)} بار تکرار`} arrow>
              <Box
                sx={{
                  px: 1.25,
                  py: 0.5,
                  borderRadius: 1.25,
                  cursor: 'default',
                  lineHeight: 1.6,
                  fontSize: word.fontSize,
                  fontWeight: word.ratio > 0.4 ? 700 : 600,
                  color: word.ratio > 0.4 ? (isDark ? 'primary.light' : 'primary.dark') : 'text.primary',
                  bgcolor: alpha(tone, 0.06 + word.ratio * 0.14),
                  border: `1px solid ${alpha(tone, 0.1 + word.ratio * 0.2)}`,
                  transition: theme.transitions.create(['background-color', 'transform']),
                  '&:hover': { bgcolor: alpha(tone, 0.24), transform: 'translateY(-1px)' },
                }}
              >
                {toFaDigits(word.text)}
                <Typography component="span" sx={{ ml: 0.75, fontSize: 12, fontWeight: 500, color: 'text.secondary' }}>
                  {fNum(word.count)}
                </Typography>
              </Box>
            </Tooltip>
          ))}
        </Box>
      </WidgetCard>

      <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center' }}>
        اندازه هر واژه نسبت به پرتکرارترین واژه این بازه است؛ عدد کنار آن تعداد تکرار است.
      </Typography>
    </WidgetCard>
  );
}
