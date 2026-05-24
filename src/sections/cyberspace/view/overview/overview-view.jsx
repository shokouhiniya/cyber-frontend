'use client';

import { DashboardContent } from 'src/layouts/dashboard';
import { useStats, useProfile, useEmotions } from 'src/api/dashboard';

import { TabOverview } from '../../overview/tab-overview';

// ----------------------------------------------------------------------

export function OverviewView() {
  const { data: profile } = useProfile();
  const { data: stats = { totalPosts: 0, totalViews: 0, totalLikes: 0, totalRetweets: 0 }, isLoading: statsLoading } = useStats();
  const { data: emotionData = {}, isLoading: emotionsLoading } = useEmotions();

  const loading = statsLoading || emotionsLoading;

  // Compute health score: positive% of total sentiment
  const totalSentiment = Object.values(emotionData).reduce((a, b) => a + b, 0);
  const positiveCount = (emotionData.hope || 0) + (emotionData.joy || 0) + (emotionData.optimism || 0);
  const healthScore = totalSentiment > 0 ? Math.round((positiveCount / totalSentiment) * 100) : null;

  return (
    <DashboardContent>
      <TabOverview
        stats={stats}
        emotionData={emotionData}
        loading={loading}
        healthScore={healthScore}
      />
    </DashboardContent>
  );
}
