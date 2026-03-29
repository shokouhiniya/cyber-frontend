'use client';

import { DashboardContent } from 'src/layouts/dashboard';
import { useStats, useEmotions } from 'src/api/dashboard';

import { TabOverview } from '../../overview/tab-overview';

// ----------------------------------------------------------------------

export function OverviewView() {
  const { data: stats = { totalPosts: 0, totalViews: 0, totalLikes: 0, totalRetweets: 0 }, isLoading: statsLoading } = useStats();
  const { data: emotionData = {}, isLoading: emotionsLoading } = useEmotions();

  const loading = statsLoading || emotionsLoading;

  return (
    <DashboardContent>
      <TabOverview stats={stats} emotionData={emotionData} loading={loading} />
    </DashboardContent>
  );
}
