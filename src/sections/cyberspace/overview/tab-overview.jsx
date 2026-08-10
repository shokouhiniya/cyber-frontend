import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useHiddenWidgets } from 'src/api/dashboard';

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
  const hidden = useHiddenWidgets();

  const handleActionClick = () => {
    router.push(paths.dashboard.recommendations);
  };

  return (
    <Stack spacing={2.5} sx={{ pb: 10 }}>
      {!hidden.has('reputation_gauge') && <ReputationGauge loading={loading} healthScore={healthScore} />}
      {!hidden.has('ai_summary') && <AISummary loading={loading} onActionClick={handleActionClick} />}
      {!hidden.has('crisis_radar') && <CrisisRadar loading={loading} />}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1.5 }}>
        {!hidden.has('trend_chart') && <TrendChart loading={loading} />}
        {!hidden.has('political_spectrum') && <PoliticalSpectrum loading={loading} />}
        {!hidden.has('hot_topics') && <HotTopics />}
      </Box>
      {!hidden.has('important_posts') && <ImportantPosts />}
    </Stack>
  );
}
