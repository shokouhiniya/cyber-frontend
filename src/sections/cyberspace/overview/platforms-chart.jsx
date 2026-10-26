import { useState } from 'react';

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

import { fNum, fShort, fPercent } from 'src/utils/format-number-fa';

import { useSourceStats } from 'src/api/dashboard';

import { Chart, useChart } from 'src/components/chart';
import { WIDGET_TOOLTIPS } from 'src/components/info-tooltip/widget-tooltips';

import { WidgetCard, WidgetToggle } from '../shared/widget-card';

// ----------------------------------------------------------------------

// Brand colours; `null` means "use the theme text colour" (black logos vanish in dark mode).
const SOURCE_CONFIG = {
  telegram: { name: 'تلگرام', color: '#0088CC' },
  bale: { name: 'بله', color: '#00B4D8' },
  rubika: { name: 'روبیکا', color: '#6C3AED' },
  eita: { name: 'ایتا', color: '#FF6F00' },
  news: { name: 'خبرگزاری', color: '#4CAF50' },
  instagram: { name: 'اینستاگرام', color: '#E4405F' },
  twitter: { name: 'توییتر (ایکس)', color: null },
  newspaper: { name: 'روزنامه', color: '#78909C' },
  media: { name: 'رسانه‌ها', color: '#26A69A' },
  aparat: { name: 'آپارات', color: '#ED145B' },
  video_media: { name: 'رسانه تصویری', color: '#FF5722' },
  forum: { name: 'فروم', color: '#795548' },
};

const TIME_FILTERS = [
  { value: 'day', label: 'امروز' },
  { value: 'week', label: '۷ روز' },
  { value: 'month', label: '۳۰ روز' },
  { value: 'quarter', label: 'فصل' },
];

const TIMEFRAME_LABEL = { day: 'امروز', week: '۷ روز گذشته', month: '۳۰ روز گذشته', quarter: 'فصل اخیر' };

export function PlatformsChart() {
  const theme = useTheme();
  const [timeframe, setTimeframe] = useState('week');
  const { data, isLoading } = useSourceStats(timeframe);

  const sources = (Array.isArray(data) ? data : []).filter((s) => s.count > 0).sort((a, b) => b.count - a.count);
  const total = sources.reduce((sum, s) => sum + s.count, 0);
  const items = sources.map((s) => {
    const cfg = SOURCE_CONFIG[s.source];
    return {
      ...s,
      // Unknown sources keep their own key so two of them never share one «سایر» bar.
      name: cfg?.name ?? s.source ?? 'سایر',
      color: cfg ? (cfg.color ?? theme.palette.text.primary) : theme.palette.grey[500],
    };
  });

  const options = useChart({
    colors: items.map((i) => i.color),
    plotOptions: { bar: { horizontal: true, distributed: true, barHeight: '58%', borderRadius: 3 } },
    legend: { show: false },
    dataLabels: {
      enabled: true,
      textAnchor: 'start',
      offsetX: 6,
      formatter: (v) => fShort(v),
      style: { fontSize: '12px', fontWeight: 700, colors: [theme.palette.text.primary] },
      background: { enabled: false },
      dropShadow: { enabled: false },
    },
    xaxis: {
      categories: items.map((i) => i.name),
      tickAmount: 4,
      labels: { formatter: (v) => fShort(v) },
    },
    yaxis: { labels: { formatter: (v) => v, style: { fontSize: '12px', fontWeight: 600 } } },
    grid: { xaxis: { lines: { show: true } }, yaxis: { lines: { show: false } }, padding: { right: 48 } },
    tooltip: {
      y: {
        title: { formatter: () => '' },
        formatter: (v) => `${fNum(v)} مطلب (${fPercent(total ? (v / total) * 100 : 0, { decimals: 1 })})`,
      },
    },
  });

  const toggle = <WidgetToggle value={timeframe} onChange={setTimeframe} options={TIME_FILTERS} />;

  return (
    <WidgetCard
      title="منابع داده"
      icon="solar:widget-5-bold-duotone"
      color="info"
      tooltip={WIDGET_TOOLTIPS.platformsChart}
      subheader={total ? `${fNum(total)} مطلب در ${TIMEFRAME_LABEL[timeframe]}` : TIMEFRAME_LABEL[timeframe]}
      action={<Box sx={{ display: { xs: 'none', sm: 'block' } }}>{toggle}</Box>}
      contentSx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      <Box sx={{ display: { xs: 'flex', sm: 'none' }, justifyContent: 'center' }}>{toggle}</Box>

      <WidgetCard
        // Inner, header-less card only for the shared loading / empty states,
        // so the timeframe toggle stays usable when a period has no data.
        sx={{ border: 0, boxShadow: 'none', bgcolor: 'transparent', borderRadius: 0 }}
        contentSx={{ p: 0 }}
        loading={isLoading}
        empty={!items.length}
        emptyIcon="solar:widget-5-bold-duotone"
        emptyText="برای این بازه آماری از پلتفرم‌ها ثبت نشده است."
      >
        <Chart
          type="bar"
          series={[{ name: 'مطلب', data: items.map((i) => i.count) }]}
          options={options}
          height={items.length * 40 + 50}
        />
      </WidgetCard>
    </WidgetCard>
  );
}
