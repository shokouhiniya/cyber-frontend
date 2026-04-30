'use client';

import { useEmotions, usePosts } from 'src/api/dashboard';
import { DashboardContent } from 'src/layouts/dashboard';

import { TabMyPages } from '../../mypages/tab-mypages';

// ----------------------------------------------------------------------

export function MyPagesView() {
  const { data: emotionData = {}, isLoading: emotionsLoading } = useEmotions();
  const { data: postsResponse, isLoading: postsLoading } = usePosts({
    limit: 50,
    keyword: 'قالیباف',
  });

  const officialPosts = postsResponse?.data || [];
  const loading = emotionsLoading || postsLoading;

  return (
    <DashboardContent>
      <TabMyPages emotionData={emotionData} loading={loading} officialPosts={officialPosts} />
    </DashboardContent>
  );
}
