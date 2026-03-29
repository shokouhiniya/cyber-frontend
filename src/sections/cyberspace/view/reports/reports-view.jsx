'use client';

import { DashboardContent } from 'src/layouts/dashboard';

import { TabReports } from '../../reports/tab-reports';

// ----------------------------------------------------------------------

export function ReportsView() {
  return (
    <DashboardContent>
      <TabReports loading={false} />
    </DashboardContent>
  );
}
