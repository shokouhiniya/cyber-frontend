import { CONFIG } from 'src/global-config';

import { OverviewView } from 'src/sections/cyberspace/view';

// ----------------------------------------------------------------------

export const metadata = { title: `داشبورد - ${CONFIG.appName}` };

export default function Page() {
  return <OverviewView />;
}
