import { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { fNum } from 'src/utils/format-number-fa';

import { useHashtags } from 'src/api/dashboard';

import { WIDGET_TOOLTIPS } from 'src/components/info-tooltip/widget-tooltips';

import { WidgetCard, WidgetToggle } from '../shared/widget-card';

// ----------------------------------------------------------------------

const TIME_FILTERS = [
  { value: '24h', label: '۲۴ ساعت' },
  { value: '7d', label: '۷ روز' },
  { value: '30d', label: '۳۰ روز' },
];

export function HotTopics() {
  const theme = useTheme();
  const [timeframe, setTimeframe] = useState('7d');
  const { data: topics = [], isLoading } = useHashtags(12, timeframe);

  const max = topics[0]?.count || 1;

  return (
    <WidgetCard
      title="هشتگ‌ها و موضوعات داغ"
      icon="solar:fire-bold-duotone"
      color="error"
      tooltip={WIDGET_TOOLTIPS.hotTopics}
      subheader="پرتکرارترین موضوعات در پست‌های مرتبط"
      loading={isLoading}
      empty={!topics.length}
      emptyText="در این بازه موضوعی ثبت نشده است."
      action={<WidgetToggle value={timeframe} onChange={setTimeframe} options={TIME_FILTERS} />}
    >
      <Stack spacing={1.25}>
        {topics.map((topic, index) => (
          <Stack key={topic.label} direction="row" alignItems="center" spacing={1.5}>
            <Typography
              variant="caption"
              sx={{ width: 20, textAlign: 'center', fontWeight: 700, color: index < 3 ? 'error.main' : 'text.disabled' }}
            >
              {fNum(index + 1)}
            </Typography>
            <Box sx={{ flex: 1, minWidth: 0, position: 'relative', height: 32, display: 'flex', alignItems: 'center' }}>
              <Box
                sx={{
                  position: 'absolute',
                  insetInlineStart: 0,
                  top: 0,
                  bottom: 0,
                  width: `${Math.max(6, (topic.count / max) * 100)}%`,
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.error.main, index < 3 ? 0.14 : 0.07),
                }}
              />
              <Typography variant="body2" noWrap sx={{ position: 'relative', px: 1.25, fontWeight: 600 }}>
                #{topic.label}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ width: 48, textAlign: 'end', fontWeight: 700, color: 'text.secondary' }}>
              {fNum(topic.count)}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </WidgetCard>
  );
}
