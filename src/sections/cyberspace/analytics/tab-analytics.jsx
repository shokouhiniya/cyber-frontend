import Stack from '@mui/material/Stack';

import { useHashtags } from 'src/api/dashboard';

import { BotVsHuman } from './bot-vs-human';
import { EmotionChart } from './emotion-chart';
import { MacroContext } from './macro-context';
import { NarrativeGap } from './narrative-gap';
import { SemanticCloud } from './semantic-cloud';
import { PlatformsChart } from '../overview/platforms-chart';

// ----------------------------------------------------------------------

export function TabAnalytics({ emotionData, loading }) {
  const { data: hashtags = [] } = useHashtags(30);

  // Shape hashtags into word cloud format
  const maxCount = hashtags[0]?.count || 1;
  const words = hashtags.map((h) => {
    const ratio = h.count / maxCount;
    const size = ratio > 0.8 ? 'xl' : ratio > 0.6 ? 'lg' : ratio > 0.4 ? 'md' : ratio > 0.2 ? 'sm' : 'xs';
    return { text: h.label, value: h.count, percent: Math.round(ratio * 100), size, sentiment: 'neutral' };
  });

  return (
    <Stack spacing={2.5} sx={{ pb: 10 }}>
      <MacroContext />
      <EmotionChart data={emotionData} loading={loading} />
      <SemanticCloud words={words} loading={loading} />
      <BotVsHuman />
      <NarrativeGap loading={loading} />
      <PlatformsChart />
    </Stack>
  );
}
