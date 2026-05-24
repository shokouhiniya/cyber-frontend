import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { AISummary } from './ai-summary';
import { HotTopics } from './hot-topics';
import { TrendChart } from './trend-chart';
import { CrisisRadar } from './crisis-radar';
import { ImportantPosts } from './important-posts';import { ReputationGauge } from './reputation-gauge';
import { PoliticalSpectrum } from './political-spectrum';

// ----------------------------------------------------------------------

export function TabOverview({ stats, emotionData, loading, healthScore = null }) {
  const theme = useTheme();
  const router = useRouter();

  const handleActionClick = () => {
    router.push(paths.dashboard.recommendations);
  };

  return (
    <Stack spacing={2.5} sx={{ pb: 10 }}>
      <ReputationGauge loading={loading} healthScore={healthScore} />
      <AISummary loading={loading} onActionClick={handleActionClick} />
      <CrisisRadar loading={loading} />
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1.5 }}>
        <TrendChart loading={loading} />
        <PoliticalSpectrum loading={loading} />
        <HotTopics />
      </Box>
      <ImportantPosts />
    </Stack>
  );
}
