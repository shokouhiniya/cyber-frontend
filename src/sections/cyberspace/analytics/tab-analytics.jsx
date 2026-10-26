import { useHiddenWidgets } from 'src/api/dashboard';

import { BotVsHuman } from './bot-vs-human';
import { EmotionChart } from './emotion-chart';
import { MacroContext } from './macro-context';
import { NarrativeGap } from './narrative-gap';
import { SemanticCloud } from './semantic-cloud';
import { PageHeader } from '../shared/page-header';
import { GridItem, WidgetGrid } from '../shared/widget-grid';
import { PlatformsChart } from '../overview/platforms-chart';

// ----------------------------------------------------------------------

export function TabAnalytics({ emotionData, loading }) {
  const hidden = useHiddenWidgets();

  return (
    <>
      <PageHeader
        title="تحلیل"
        description="بستر کلان، چشم‌انداز احساسی، واژه‌های پرتکرار، شکاف روایت رسمی و مردمی و سهم پلتفرم‌ها."
      />

      <WidgetGrid sx={{ pb: { xs: 10, lg: 4 } }}>
        {!hidden.has('macro_context') && (
          <GridItem>
            <MacroContext />
          </GridItem>
        )}
        {!hidden.has('emotion_chart') && (
          <GridItem span={{ md: 6, lg: 7 }}>
            <EmotionChart data={emotionData} loading={loading} />
          </GridItem>
        )}
        {!hidden.has('bot_vs_human') && (
          <GridItem span={{ md: 6, lg: 5 }}>
            <BotVsHuman />
          </GridItem>
        )}
        {!hidden.has('narrative_gap') && (
          <GridItem span={{ md: 6, lg: 7 }}>
            <NarrativeGap />
          </GridItem>
        )}
        {!hidden.has('platforms_chart') && (
          <GridItem span={{ md: 6, lg: 5 }}>
            <PlatformsChart />
          </GridItem>
        )}
        {!hidden.has('semantic_cloud') && (
          <GridItem>
            <SemanticCloud />
          </GridItem>
        )}
      </WidgetGrid>
    </>
  );
}
