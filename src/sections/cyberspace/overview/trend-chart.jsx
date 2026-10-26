import { useState } from 'react';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { fNum, fPercent } from 'src/utils/format-number-fa';

import { useProfile, useTrendData } from 'src/api/dashboard';

import { Chart, useChart, SENTIMENT_COLORS } from 'src/components/chart';
import { WIDGET_TOOLTIPS } from 'src/components/info-tooltip/widget-tooltips';

import { WidgetCard, WidgetToggle } from '../shared/widget-card';

// ----------------------------------------------------------------------

const TIME_FILTERS = [
  { value: '7d', label: '۷ روز', hours: 168 },
  { value: '30d', label: '۳۰ روز', hours: 720 },
];

const UNIT_FILTERS = [
  { value: 'count', label: 'تعداد' },
  { value: 'percent', label: 'درصد' },
];

// Group hourly points into calendar days (Tehran date), oldest first
function aggregateByDay(points) {
  const byDay = new Map();
  for (const pt of points) {
    const d = new Date(pt.hour);
    const key = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Tehran' });
    if (!byDay.has(key)) {
      byDay.set(key, {
        key,
        label: d.toLocaleDateString('fa-IR', { month: 'short', day: 'numeric', timeZone: 'Asia/Tehran' }),
        positive: 0,
        negative: 0,
        neutral: 0,
      });
    }
    const day = byDay.get(key);
    day.positive += pt.positiveCount || 0;
    day.negative += pt.negativeCount || 0;
    day.neutral += pt.neutralCount || 0;
  }
  return Array.from(byDay.values()).sort((a, b) => a.key.localeCompare(b.key));
}

export function TrendChart({ loading: parentLoading }) {
  const [timeFilter, setTimeFilter] = useState('7d');
  const [unit, setUnit] = useState('count');

  const { data: profile } = useProfile();
  const tf = TIME_FILTERS.find((f) => f.value === timeFilter);
  const { data: trendRaw, isLoading } = useTrendData(profile?.id, tf.hours);

  const days = aggregateByDay(trendRaw?.trend || []);
  const totals = days.reduce(
    (acc, d) => ({
      positive: acc.positive + d.positive,
      neutral: acc.neutral + d.neutral,
      negative: acc.negative + d.negative,
    }),
    { positive: 0, neutral: 0, negative: 0 }
  );
  const grandTotal = totals.positive + totals.neutral + totals.negative;
  const isPercent = unit === 'percent';

  const series = [
    { name: 'مثبت', data: days.map((d) => d.positive) },
    { name: 'خنثی', data: days.map((d) => d.neutral) },
    { name: 'منفی', data: days.map((d) => d.negative) },
  ];

  const options = useChart({
    chart: { stacked: true, stackType: isPercent ? '100%' : 'normal' },
    colors: [SENTIMENT_COLORS.positive, SENTIMENT_COLORS.neutral, SENTIMENT_COLORS.negative],
    xaxis: {
      categories: days.map((d) => d.label),
      labels: { rotate: 0, hideOverlappingLabels: true, trim: true },
      tickAmount: Math.min(days.length, 8),
    },
    yaxis: {
      max: isPercent ? 100 : undefined,
      labels: { formatter: (v) => (isPercent ? fPercent(v) : fNum(v)) },
    },
    plotOptions: { bar: { columnWidth: days.length > 14 ? '70%' : '45%', borderRadius: 2 } },
    legend: { show: false },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (v, { dataPointIndex }) => {
          const d = days[dataPointIndex];
          const dayTotal = d ? d.positive + d.neutral + d.negative : 0;
          const pct = dayTotal ? Math.round((v / dayTotal) * 100) : 0;
          return `${fNum(v)} پست (${fPercent(pct)})`;
        },
      },
    },
  });

  const summary = [
    { key: 'positive', label: 'مثبت', color: SENTIMENT_COLORS.positive },
    { key: 'neutral', label: 'خنثی', color: SENTIMENT_COLORS.neutral },
    { key: 'negative', label: 'منفی', color: SENTIMENT_COLORS.negative },
  ];

  return (
    <WidgetCard
      title="روند احساسات"
      icon="solar:chart-2-bold-duotone"
      tooltip={WIDGET_TOOLTIPS.trendChart}
      subheader="تعداد پست‌های مثبت، خنثی و منفی در هر روز"
      loading={parentLoading || isLoading}
      empty={!days.length}
      action={<WidgetToggle value={timeFilter} onChange={setTimeFilter} options={TIME_FILTERS} />}
    >
      {/* Totals for the selected range — each sentiment with its share */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1.5} sx={{ mb: 1.5 }}>
        <Stack direction="row" spacing={2.5} flexWrap="wrap">
          {summary.map((s) => (
            <Stack key={s.key} spacing={0.25}>
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, display: 'inline-block' }} />
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {s.label}
                </Typography>
              </Stack>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                {fNum(totals[s.key])}
                <Typography component="span" variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, ml: 0.75 }}>
                  ({fPercent(grandTotal ? (totals[s.key] / grandTotal) * 100 : 0)})
                </Typography>
              </Typography>
            </Stack>
          ))}
        </Stack>
        <WidgetToggle value={unit} onChange={setUnit} options={UNIT_FILTERS} />
      </Stack>

      <Chart type="bar" series={series} options={options} height={260} />
    </WidgetCard>
  );
}
