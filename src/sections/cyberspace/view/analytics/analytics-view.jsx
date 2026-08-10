'use client';

import { useEmotions } from 'src/api/dashboard';
import { DashboardContent } from 'src/layouts/dashboard';

import { TabAnalytics } from '../../analytics/tab-analytics';

// ----------------------------------------------------------------------

export function AnalyticsView() {
  const { data: emotionData = {}, isLoading } = useEmotions();

  return (
    <DashboardContent>
      <TabAnalytics emotionData={emotionData} loading={isLoading} />
    </DashboardContent>
  );
}
