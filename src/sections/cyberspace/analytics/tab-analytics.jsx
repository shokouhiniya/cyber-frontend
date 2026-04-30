import Stack from '@mui/material/Stack';

import { GeoHeatmap } from './geo-heatmap';
import { BotVsHuman } from './bot-vs-human';
import { EmotionChart } from './emotion-chart';
import { MacroContext } from './macro-context';
import { NarrativeGap } from './narrative-gap';
import { SemanticCloud } from './semantic-cloud';
import { PlatformsChart } from '../overview/platforms-chart';

// ----------------------------------------------------------------------

export function TabAnalytics({ emotionData, loading }) {
  return (
    <Stack spacing={2.5} sx={{ pb: 10 }}>
      <MacroContext />
      <EmotionChart data={emotionData} loading={loading} />
      <SemanticCloud loading={loading} />
      <BotVsHuman />
      <NarrativeGap loading={loading} />
      <GeoHeatmap loading={loading} />
      <PlatformsChart />
    </Stack>
  );
}
