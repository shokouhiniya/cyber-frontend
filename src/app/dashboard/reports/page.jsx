import { CONFIG } from 'src/global-config';

import { ReportsView } from 'src/sections/cyberspace/view';

// ----------------------------------------------------------------------

export const metadata = { title: `گزارش‌ها - ${CONFIG.appName}` };

export default function Page() {
  return <ReportsView />;
}
