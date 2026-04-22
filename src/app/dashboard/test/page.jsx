import { CONFIG } from 'src/global-config';

import { TestView } from 'src/sections/cyberspace/view';

// ----------------------------------------------------------------------

export const metadata = { title: `تست API - ${CONFIG.appName}` };

export default function Page() {
  return <TestView />;
}
