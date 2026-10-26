'use client';

import { useOfficialPosts } from 'src/api/dashboard';
import { DashboardContent } from 'src/layouts/dashboard';

import { TabMyPages } from '../../mypages/tab-mypages';

// ----------------------------------------------------------------------

// How many of the latest official-page posts the page loads. Content
// analysis and the timeline are both built from this sample.
const OFFICIAL_POSTS_LIMIT = 100;

export function MyPagesView() {
  // Fetch posts published FROM the profile's official pages
  const { data: officialResponse, isLoading } = useOfficialPosts({ limit: OFFICIAL_POSTS_LIMIT });

  const officialPosts = officialResponse?.data || [];
  const officialTotal = officialResponse?.pagination?.total ?? officialPosts.length;

  return (
    <DashboardContent>
      <TabMyPages loading={isLoading} officialPosts={officialPosts} officialTotal={officialTotal} />
    </DashboardContent>
  );
}
