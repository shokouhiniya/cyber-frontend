'use client';

import { useState } from 'react';

import { DashboardContent } from 'src/layouts/dashboard';

import { ViralPosts } from '../../posts/viral-posts';
import { PageHeader } from '../../shared/page-header';
import { PlatformSummary } from '../../posts/platform-summary';
import { MostViewedPosts } from '../../posts/most-viewed-posts';
import { GridItem, WidgetGrid } from '../../shared/widget-grid';
import { InfluencerMapping } from '../../posts/influencer-mapping';
import { ControversialPosts } from '../../posts/controversial-posts';

// ----------------------------------------------------------------------

export function PostsView() {
  const [activePlatform, setActivePlatform] = useState(null);

  const handlePlatformFilter = (key) => {
    setActivePlatform((prev) => (prev === key ? null : key));
  };

  const clearPlatform = () => setActivePlatform(null);

  return (
    <DashboardContent>
      <PageHeader
        title="پست‌ها"
        description="پربازدیدترین، پربحث‌ترین و پرتکرارترین پست‌ها به تفکیک پلتفرم، و حساب‌هایی که بیشترین اثر را در موافقت یا مخالفت دارند."
      />

      <WidgetGrid>
        <GridItem>
          <PlatformSummary onPlatformFilter={handlePlatformFilter} activePlatform={activePlatform} />
        </GridItem>

        <GridItem span={{ md: 6, lg: 4 }}>
          <MostViewedPosts platform={activePlatform} onClearPlatform={clearPlatform} />
        </GridItem>
        <GridItem span={{ md: 6, lg: 4 }}>
          <ControversialPosts platform={activePlatform} onClearPlatform={clearPlatform} />
        </GridItem>
        <GridItem span={{ md: 12, lg: 4 }}>
          <ViralPosts platform={activePlatform} onClearPlatform={clearPlatform} />
        </GridItem>

        <GridItem>
          <InfluencerMapping />
        </GridItem>
      </WidgetGrid>
    </DashboardContent>
  );
}
