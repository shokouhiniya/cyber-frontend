'use client';

import dynamic from 'next/dynamic';

import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

// ----------------------------------------------------------------------

// ApexCharts touches `window` on import, so it is loaded on the client only.
const ApexChart = dynamic(() => import('react-apexcharts').then((mod) => mod.default), {
  ssr: false,
  loading: () => <Skeleton variant="rounded" sx={{ width: 1, height: 1, minHeight: 120 }} />,
});

/**
 * Thin wrapper around react-apexcharts. Build `options` with `useChart()`
 * so every chart shares the dashboard's font, RTL handling, colors and
 * Persian number formatting.
 *
 *   const options = useChart({ xaxis: { categories }, colors: [...] });
 *   <Chart type="bar" series={series} options={options} height={260} />
 */
export function Chart({ type = 'line', series, options, height = 260, sx, ...other }) {
  return (
    <Box
      dir="ltr"
      sx={[
        {
          width: 1,
          height,
          flexShrink: 0,
          // Apex tooltips render inside the chart box — keep them on top of cards
          '& .apexcharts-tooltip': { zIndex: 10 },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <ApexChart type={type} series={series} options={options} width="100%" height="100%" />
    </Box>
  );
}
