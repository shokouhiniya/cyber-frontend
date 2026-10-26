import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useHiddenWidgets } from 'src/api/dashboard';

import { AISummary } from './ai-summary';
import { HotTopics } from './hot-topics';
import { TrendChart } from './trend-chart';
import { CrisisRadar } from './crisis-radar';
import { ImportantPosts } from './important-posts';
import { PageHeader } from '../shared/page-header';
import { ReputationGauge } from './reputation-gauge';
import { PoliticalSpectrum } from './political-spectrum';
import { GridItem, WidgetGrid } from '../shared/widget-grid';

// ----------------------------------------------------------------------

export function TabOverview({ loading, healthScore = null }) {
  const router = useRouter();
  const hidden = useHiddenWidgets();

  const handleActionClick = () => {
    router.push(paths.dashboard.recommendations);
  };

  return (
    <>
      <PageHeader
        title="داشبورد"
        description="نمای کلی وضعیت اعتبار، روند احساسات و موضوعات داغ در فضای مجازی."
      />

      <WidgetGrid sx={{ pb: { xs: 10, lg: 4 } }}>
        {!hidden.has('reputation_gauge') && (
          <GridItem span={{ md: 5, lg: 4 }}>
            <ReputationGauge loading={loading} healthScore={healthScore} />
          </GridItem>
        )}
        {!hidden.has('ai_summary') && (
          <GridItem span={{ md: 7, lg: 8 }}>
            <AISummary loading={loading} onActionClick={handleActionClick} />
          </GridItem>
        )}
        {!hidden.has('crisis_radar') && (
          <GridItem span={{ md: 5, lg: 4 }}>
            <CrisisRadar loading={loading} />
          </GridItem>
        )}
        {!hidden.has('trend_chart') && (
          <GridItem span={{ md: 7, lg: 8 }}>
            <TrendChart loading={loading} />
          </GridItem>
        )}
        {!hidden.has('political_spectrum') && (
          <GridItem span={{ md: 6 }}>
            <PoliticalSpectrum loading={loading} />
          </GridItem>
        )}
        {!hidden.has('hot_topics') && (
          <GridItem span={{ md: 6 }}>
            <HotTopics />
          </GridItem>
        )}
        {!hidden.has('important_posts') && (
          <GridItem>
            <ImportantPosts />
          </GridItem>
        )}
      </WidgetGrid>
    </>
  );
}
