import { useHiddenWidgets } from 'src/api/dashboard';

import { PromiseTracker } from './promise-tracker';
import { PageHeader } from '../shared/page-header';
import { ContentAnalysis } from './content-analysis';
import { OfficialAccounts } from './official-accounts';
import { OfficialTimeline } from './official-timeline';
import { GridItem, WidgetGrid } from '../shared/widget-grid';

// ----------------------------------------------------------------------

export function TabMyPages({ loading, officialPosts = [], officialTotal = 0 }) {
  const hidden = useHiddenWidgets();

  const showAccounts = !hidden.has('official_accounts');
  const showAnalysis = !hidden.has('content_analysis');
  // When one of the pair is hidden, the other takes the full row
  const pairSpan = showAccounts && showAnalysis;

  return (
    <>
      <PageHeader
        title="رسانه"
        description="صفحات رسمی این شخصیت، آخرین انتشارهای آن‌ها، الگوی انتشار محتوا و واکنش مردم به وعده‌های ثبت‌شده."
      />

      <WidgetGrid sx={{ pb: { xs: 10, lg: 4 } }}>
        {showAccounts && (
          <GridItem span={pairSpan ? { lg: 5 } : {}}>
            <OfficialAccounts posts={officialPosts} loading={loading} />
          </GridItem>
        )}
        {showAnalysis && (
          <GridItem span={pairSpan ? { lg: 7 } : {}}>
            <ContentAnalysis loading={loading} posts={officialPosts} total={officialTotal} />
          </GridItem>
        )}
        {!hidden.has('official_timeline') && (
          <GridItem>
            <OfficialTimeline loading={loading} posts={officialPosts} total={officialTotal} />
          </GridItem>
        )}
        {!hidden.has('promise_tracker') && (
          <GridItem>
            <PromiseTracker />
          </GridItem>
        )}
      </WidgetGrid>
    </>
  );
}
