import { CONFIG } from 'src/global-config';

import { AnalyticsView } from 'src/sections/cyberspace/view';

// ----------------------------------------------------------------------

export const metadata = { title: `تحلیل - ${CONFIG.appName}` };

export default function Page() {
  return <AnalyticsView />;
}
