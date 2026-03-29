import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { AISummary } from './ai-summary';
import { HotTopics } from './hot-topics';
import { TrendChart } from './trend-chart';
import { CrisisRadar } from './crisis-radar';
import { PlatformsChart } from './platforms-chart';
import { ImportantPosts } from './important-posts';
import { ReputationGauge } from './reputation-gauge';

// ----------------------------------------------------------------------

export function TabOverview({ stats, emotionData, loading }) {
  const theme = useTheme();
  const router = useRouter();

  const handleActionClick = () => {
    router.push(paths.dashboard.recommendations);
  };

  return (
    <Stack spacing={2.5} sx={{ pb: 10 }}>
      {/* Header: شاخص سلامت اعتبار */}
      <ReputationGauge loading={loading} />

      {/* Top Section: خلاصه AI */}
      <AISummary loading={loading} onActionClick={handleActionClick} />

      {/* Crisis Radar */}
      <CrisisRadar loading={loading} />

      {/* Middle Section: سه نمودار */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 1.5,
        }}
      >
        <TrendChart loading={loading} />
        <PlatformsChart />
        <HotTopics />
      </Box>

      {/* Bottom Section: مهم‌ترین محتواها */}
      <ImportantPosts />
    </Stack>
  );
}
