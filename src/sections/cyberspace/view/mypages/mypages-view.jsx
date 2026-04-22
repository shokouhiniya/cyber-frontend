'use client';

import { useEmotions } from 'src/api/dashboard';
import { DashboardContent } from 'src/layouts/dashboard';

import { TabMyPages } from '../../mypages/tab-mypages';

// ----------------------------------------------------------------------

export function MyPagesView() {
  const { data: emotionData = {}, isLoading } = useEmotions();

  return (
    <DashboardContent>
      <TabMyPages emotionData={emotionData} loading={isLoading} />
    </DashboardContent>
  );
}
