import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { fNum, fPercent } from 'src/utils/format-number-fa';

import { Chart, useChart, SENTIMENT_COLORS } from 'src/components/chart';
import { WIDGET_TOOLTIPS } from 'src/components/info-tooltip/widget-tooltips';

import { WidgetCard } from '../shared/widget-card';

// ----------------------------------------------------------------------

/**
 * One fixed set of outlook categories, in a fixed order (hopeful → worried),
 * each with one colour. The donut and the breakdown list both read from this
 * so a category always has the same name and colour.
 */
const CATEGORIES = [
  { key: 'confident', label: 'اطمینان' },
  { key: 'optimistic', label: 'امیدواری' },
  { key: 'neutral', label: 'خنثی' },
  { key: 'apprehensive', label: 'تردید' },
  { key: 'anxious', label: 'نگرانی' },
  { key: 'other', label: 'سایر' },
];

// Older posts were labelled from plain sentiment (positive → hope, negative → worry).
const ALIASES = { hope: 'optimistic', worry: 'anxious' };

function useCategoryColors() {
  const theme = useTheme();
  return {
    confident: theme.palette.info.main,
    optimistic: SENTIMENT_COLORS.positive,
    neutral: SENTIMENT_COLORS.neutral,
    apprehensive: theme.palette.warning.main,
    anxious: SENTIMENT_COLORS.negative,
    other: theme.palette.secondary.main,
  };
}

function groupEmotions(data = {}) {
  const counts = Object.fromEntries(CATEGORIES.map((c) => [c.key, 0]));
  Object.entries(data || {}).forEach(([rawKey, value]) => {
    const n = Number(value) || 0;
    const key = ALIASES[String(rawKey).toLowerCase()] ?? String(rawKey).toLowerCase();
    if (key in counts) counts[key] += n;
    else counts.other += n;
  });
  return counts;
}

export function EmotionChart({ data, loading }) {
  const theme = useTheme();
  const colors = useCategoryColors();

  const counts = groupEmotions(data);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  // Keep the fixed order; drop empty categories so the legend stays short.
  const items = CATEGORIES.filter((c) => counts[c.key] > 0).map((c) => ({
    ...c,
    count: counts[c.key],
    percent: total ? (counts[c.key] / total) * 100 : 0,
    color: colors[c.key],
  }));

  const options = useChart({
    labels: items.map((i) => i.label),
    colors: items.map((i) => i.color),
    stroke: { width: 2, colors: [theme.palette.background.paper] },
    legend: { show: false },
    tooltip: {
      y: {
        formatter: (v) => `${fNum(v)} پست (${fPercent(total ? (v / total) * 100 : 0, { decimals: 1 })})`,
      },
    },
    plotOptions: {
      pie: { donut: { labels: { total: { label: 'پست' } } } },
    },
  });

  return (
    <WidgetCard
      title="چشم‌انداز عمومی"
      icon="solar:chart-2-bold-duotone"
      color="primary"
      tooltip={WIDGET_TOOLTIPS.emotionChart}
      subheader={total ? `حالت احساسی غالب در ${fNum(total)} پست تحلیل‌شده` : undefined}
      loading={loading}
      empty={!total}
      emptyText="هنوز پستی برای تحلیل احساسات وجود ندارد."
    >
      <Stack
        direction={{ xs: 'column', sm: 'row', md: 'column', lg: 'row' }}
        alignItems="center"
        spacing={{ xs: 2, sm: 3, md: 2, lg: 3 }}
      >
        <Box sx={{ width: 220, maxWidth: 1, flexShrink: 0 }}>
          <Chart type="donut" series={items.map((i) => i.count)} options={options} height={220} />
        </Box>

        <Stack spacing={1.5} sx={{ flex: 1, width: 1, minWidth: 0 }}>
          {items.map((item) => (
            <Box key={item.key}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.75 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color, flexShrink: 0 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                    {item.label}
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="baseline" spacing={1}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 12 }}>
                    {fNum(item.count)} پست
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, minWidth: 44, textAlign: 'left' }}>
                    {fPercent(item.percent, { decimals: 1 })}
                  </Typography>
                </Stack>
              </Stack>
              <Box sx={{ height: 6, borderRadius: 1, bgcolor: alpha(theme.palette.grey[500], 0.12), overflow: 'hidden' }}>
                <Box
                  sx={{
                    width: `${item.percent}%`,
                    height: 1,
                    borderRadius: 1,
                    bgcolor: item.color,
                    transition: theme.transitions.create('width'),
                  }}
                />
              </Box>
            </Box>
          ))}
        </Stack>
      </Stack>
    </WidgetCard>
  );
}
