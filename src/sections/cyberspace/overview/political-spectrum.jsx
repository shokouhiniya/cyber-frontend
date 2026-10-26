import { useState } from 'react';

import { fNum, fPercent } from 'src/utils/format-number-fa';

import { useAiContent } from 'src/api/dashboard';

import { Chart, useChart, SENTIMENT_COLORS } from 'src/components/chart';
import { WIDGET_TOOLTIPS } from 'src/components/info-tooltip/widget-tooltips';

import { WidgetCard, WidgetToggle } from '../shared/widget-card';

// ----------------------------------------------------------------------

const UNIT_FILTERS = [
  { value: 'count', label: 'تعداد' },
  { value: 'percent', label: 'درصد' },
];

export function PoliticalSpectrum({ loading }) {
  const [unit, setUnit] = useState('count');
  const { data: aiData, isLoading } = useAiContent('political_spectrum');

  const brackets = (Array.isArray(aiData?.llm_parsed) ? aiData.llm_parsed : []).map((b) => ({
    label: b.label,
    positive: b.positive || 0,
    neutral: b.neutral || 0,
    negative: b.negative || 0,
  }));
  const isPercent = unit === 'percent';

  const series = [
    { name: 'مثبت', data: brackets.map((b) => b.positive) },
    { name: 'خنثی', data: brackets.map((b) => b.neutral) },
    { name: 'منفی', data: brackets.map((b) => b.negative) },
  ];

  const options = useChart({
    chart: { stacked: true, stackType: isPercent ? '100%' : 'normal' },
    colors: [SENTIMENT_COLORS.positive, SENTIMENT_COLORS.neutral, SENTIMENT_COLORS.negative],
    plotOptions: { bar: { horizontal: true, barHeight: '58%', borderRadius: 3 } },
    xaxis: {
      categories: brackets.map((b) => b.label),
      labels: { formatter: (v) => (isPercent ? fPercent(v) : fNum(v)) },
    },
    yaxis: { labels: { formatter: (v) => v, style: { fontSize: '13px', fontWeight: 600 } } },
    grid: { xaxis: { lines: { show: true } }, yaxis: { lines: { show: false } } },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (v, { dataPointIndex }) => {
          const b = brackets[dataPointIndex];
          const total = b ? b.positive + b.neutral + b.negative : 0;
          return `${fNum(v)} پست (${fPercent(total ? (v / total) * 100 : 0)})`;
        },
      },
    },
  });

  return (
    <WidgetCard
      title="طیف سیاسی"
      icon="solar:scale-bold-duotone"
      color="secondary"
      tooltip={WIDGET_TOOLTIPS.politicalSpectrum}
      subheader="احساس پست‌های هر جناح نسبت به این شخصیت (آخرین جمع‌آوری)"
      loading={loading || isLoading}
      empty={!brackets.length}
      emptyText="هنوز پستی با طیف سیاسی مشخص ثبت نشده است."
      action={<WidgetToggle value={unit} onChange={setUnit} options={UNIT_FILTERS} />}
    >
      <Chart type="bar" series={series} options={options} height={Math.max(200, brackets.length * 48 + 70)} />
    </WidgetCard>
  );
}
