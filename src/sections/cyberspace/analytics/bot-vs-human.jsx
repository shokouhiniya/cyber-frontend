import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { fNum, fPercent } from 'src/utils/format-number-fa';

import { useUserDistribution } from 'src/api/dashboard';

import { Chart, useChart } from 'src/components/chart';
import { WIDGET_TOOLTIPS } from 'src/components/info-tooltip/widget-tooltips';

import { WidgetCard } from '../shared/widget-card';

// ----------------------------------------------------------------------

/**
 * Splits stored posts by how many views they got. The backend buckets are
 * view-count thresholds, not bot detection: «کم‌بازدید» is ≤ ۱٬۰۰۰ views,
 * which only hints at automated / low-reach activity.
 */
export function BotVsHuman() {
  const theme = useTheme();
  const { data, isLoading } = useUserDistribution();

  const influencers = Number(data?.influencers) || 0;
  const regular = Number(data?.regular) || 0;
  const lowReach = Number(data?.suspicious) || 0;
  const classified = influencers + regular + lowReach;
  const total = Math.max(Number(data?.total) || 0, classified);
  // Posts with no view count (e.g. platforms that don't report views) fall in no bucket.
  const unknown = total - classified;

  const pct = (n) => (total ? (n / total) * 100 : 0);

  const segments = [
    {
      key: 'influencers',
      label: 'پربازدید (اینفلوئنسر)',
      hint: 'بیش از ۱۰۰ هزار بازدید',
      count: influencers,
      color: theme.palette.primary.main,
    },
    {
      key: 'regular',
      label: 'کاربران عادی',
      hint: '۱ تا ۱۰۰ هزار بازدید',
      count: regular,
      color: theme.palette.info.main,
    },
    {
      key: 'low',
      label: 'کم‌بازدید / احتمال ربات',
      hint: '۱٬۰۰۰ بازدید یا کمتر',
      count: lowReach,
      color: theme.palette.warning.main,
    },
    ...(unknown > 0
      ? [
          {
            key: 'unknown',
            label: 'بدون آمار بازدید',
            hint: 'پلتفرم تعداد بازدید را گزارش نمی‌کند',
            count: unknown,
            color: theme.palette.grey[500],
          },
        ]
      : []),
  ].map((s) => ({ ...s, percent: pct(s.count) }));

  const options = useChart({
    colors: segments.map((s) => s.color),
    plotOptions: {
      bar: { horizontal: true, distributed: true, barHeight: '56%', borderRadius: 4 },
    },
    legend: { show: false },
    dataLabels: {
      enabled: true,
      textAnchor: 'start',
      offsetX: 6,
      formatter: (v) => fPercent(pct(v), { decimals: 1 }),
      style: { fontSize: '12px', fontWeight: 700, colors: [theme.palette.text.primary] },
      background: { enabled: false },
      dropShadow: { enabled: false },
    },
    xaxis: {
      categories: segments.map((s) => s.label),
      labels: { formatter: (v) => fNum(v) },
    },
    yaxis: { labels: { formatter: (v) => v, style: { fontSize: '12px', fontWeight: 600 }, maxWidth: 160 } },
    grid: { xaxis: { lines: { show: true } }, yaxis: { lines: { show: false } }, padding: { right: 40 } },
    tooltip: {
      y: {
        title: { formatter: () => '' },
        formatter: (v) => `${fNum(v)} پست (${fPercent(pct(v), { decimals: 1 })})`,
      },
    },
  });

  return (
    <WidgetCard
      title="تفکیک پست‌ها بر اساس بازدید"
      icon="solar:shield-user-bold-duotone"
      color="info"
      tooltip={WIDGET_TOOLTIPS.botVsHuman}
      subheader="معیار فقط تعداد بازدید است؛ «کم‌بازدید» یعنی ۱٬۰۰۰ بازدید یا کمتر و به معنی تشخیص قطعی ربات نیست."
      loading={isLoading}
      empty={!total}
      emptyText="هنوز پستی برای این تفکیک ثبت نشده است."
    >
      <Chart type="bar" series={[{ name: 'پست', data: segments.map((s) => s.count) }]} options={options} height={segments.length * 52 + 50} />

      <Box
        sx={{
          mt: 2,
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        }}
      >
        {segments.map((s) => (
          <Stack key={s.key} spacing={0.25} sx={{ minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: s.color, flexShrink: 0 }} />
              <Typography variant="caption" sx={{ fontSize: 12, color: 'text.secondary' }} noWrap>
                {s.label}
              </Typography>
            </Stack>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {fNum(s.count)}
              <Typography component="span" variant="caption" sx={{ color: 'text.secondary', fontSize: 12, mx: 0.5 }}>
                ({fPercent(s.percent, { decimals: 1 })})
              </Typography>
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 11 }}>
              {s.hint}
            </Typography>
          </Stack>
        ))}
      </Box>

      <Typography variant="caption" component="div" sx={{ mt: 2, color: 'text.secondary', fontSize: 12 }}>
        مجموع: {fNum(total)} پست
      </Typography>
    </WidgetCard>
  );
}
