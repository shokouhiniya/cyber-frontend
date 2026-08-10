'use client';

import { DashboardContent } from 'src/layouts/dashboard';

import { TabRecommendations } from '../../recommendations/tab-recommendations';

// ----------------------------------------------------------------------

export function RecommendationsView() {
  return (
    <DashboardContent>
      <TabRecommendations loading={false} />
    </DashboardContent>
  );
}
