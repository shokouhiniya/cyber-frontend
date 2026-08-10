import { CONFIG } from 'src/global-config';

import { OverviewView } from 'src/sections/cyberspace/view';

// ----------------------------------------------------------------------

export const metadata = { title: `نمای کلی - ${CONFIG.appName}` };

export default function Page() {
  return <OverviewView />;
}
