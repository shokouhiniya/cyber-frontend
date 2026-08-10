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

  // ── Health score formula ──────────────────────────────────────────────
  // Net sentiment balance: 50 + (positive% - negative%) / 2
  //
  // Why not raw positive%:
  //   - Political content is naturally dominated by neutral coverage
  //   - Raw positive% punishes profiles for having neutral posts
  //   - A profile with 30% positive / 10% negative should score well
  //
  // This formula:
  //   - Centers at 50 (equal positive and negative = neutral baseline)
  //   - Reaches 100 only when all posts are positive
  //   - Reaches 0 only when all posts are negative
  //   - Neutral posts don't move the needle either way
  //   - Example: 23% pos / 32% neg → 50 + (23-32)/2 = 45.5 → "متوسط"
  //   - Example: 35% pos / 15% neg → 50 + (35-15)/2 = 60 → "خوب"
  const totalSentiment = Object.values(emotionData).reduce((a, b) => a + b, 0);
  const positiveCount = (emotionData.optimistic || 0) + (emotionData.confident || 0) + (emotionData.hope || 0);
  const negativeCount = (emotionData.anxious || 0) + (emotionData.apprehensive || 0) + (emotionData.worry || 0);
  const healthScore = totalSentiment > 0
    ? Math.min(100, Math.max(0, Math.round(50 + ((positiveCount - negativeCount) / totalSentiment) * 50)))
    : null;

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
