import { merge } from 'es-toolkit';
import { varAlpha } from 'minimal-shared/utils';

import { useTheme } from '@mui/material/styles';

import { fNum } from 'src/utils/format-number-fa';

// ----------------------------------------------------------------------

/** Sentiment colors (brand palette) used by every chart, so «مثبت» is always the same green. */
export const SENTIMENT_COLORS = {
  positive: '#00A651',
  neutral: '#A7A9AC',
  negative: '#ED1C24',
};

/**
 * Base ApexCharts options for the dashboard: the theme font, Persian digits on
 * axes and tooltips, theme-aware grid/label colors (light and dark), no
 * toolbar, and calm animations. Pass chart-specific options to override.
 */
export function useChart(options = {}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const labelColor = theme.palette.text.secondary;
  const gridColor = varAlpha(theme.vars.palette.grey['500Channel'], 0.2);

  const base = {
    chart: {
      toolbar: { show: false },
      zoom: { enabled: false },
      parentHeightOffset: 0,
      fontFamily: theme.typography.fontFamily,
      foreColor: labelColor,
      background: 'transparent',
      animations: { enabled: true, speed: 400, animateGradually: { enabled: false } },
    },
    theme: { mode: isDark ? 'dark' : 'light' },
    colors: [
      theme.palette.primary.main,
      theme.palette.info.main,
      theme.palette.warning.main,
      theme.palette.error.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
    ],
    states: {
      hover: { filter: { type: 'darken' } },
      active: { filter: { type: 'darken' } },
    },
    fill: { opacity: 1 },
    dataLabels: { enabled: false },
    stroke: { width: 2.5, curve: 'smooth', lineCap: 'round' },
    grid: {
      strokeDashArray: 3,
      borderColor: gridColor,
      padding: { top: 0, right: 8, bottom: 0, left: 8 },
      xaxis: { lines: { show: false } },
    },
    xaxis: {
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { fontSize: '12px', colors: labelColor } },
      tooltip: { enabled: false },
    },
    yaxis: {
      labels: {
        style: { fontSize: '12px', colors: labelColor },
        formatter: (v) => (typeof v === 'number' ? fNum(v) : v),
      },
    },
    markers: { size: 0, strokeColors: theme.palette.background.paper },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
      fillSeriesColor: false,
      x: { show: true },
      y: { formatter: (v) => (typeof v === 'number' ? fNum(v) : v) },
      style: { fontFamily: theme.typography.fontFamily, fontSize: '12px' },
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'right',
      fontSize: '13px',
      fontWeight: 500,
      labels: { colors: theme.palette.text.primary },
      markers: { size: 6, shape: 'circle', offsetX: 6 },
      itemMargin: { horizontal: 10, vertical: 4 },
    },
    plotOptions: {
      bar: { borderRadius: 4, borderRadiusApplication: 'end', columnWidth: '55%' },
      pie: {
        donut: {
          size: '72%',
          labels: {
            show: true,
            value: { fontSize: '22px', fontWeight: 700, color: theme.palette.text.primary, formatter: (v) => fNum(Number(v)) },
            total: {
              show: true,
              label: 'مجموع',
              color: labelColor,
              fontSize: '13px',
              formatter: (w) => fNum(w.globals.seriesTotals.reduce((a, b) => a + b, 0)),
            },
          },
        },
      },
    },
    responsive: [
      {
        breakpoint: theme.breakpoints.values.sm,
        options: { plotOptions: { bar: { columnWidth: '70%' } } },
      },
    ],
  };

  return merge(base, options);
}
