'use client';

import { DashboardContent } from 'src/layouts/dashboard';
import { useEmotions, useOfficialPosts } from 'src/api/dashboard';

import { TabMyPages } from '../../mypages/tab-mypages';

// ----------------------------------------------------------------------

export function MyPagesView() {
  const { data: emotionData = {}, isLoading: emotionsLoading } = useEmotions();

  // Fetch posts published FROM the profile's official pages
  const { data: officialResponse, isLoading: postsLoading } = useOfficialPosts({ limit: 100 });

  const officialPosts = officialResponse?.data || [];
  const loading = emotionsLoading || postsLoading;

  return (
    <DashboardContent>
      <TabMyPages emotionData={emotionData} loading={loading} officialPosts={officialPosts} />
    </DashboardContent>
  );
}
