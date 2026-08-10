import { CONFIG } from 'src/global-config';

import { RecommendationsView } from 'src/sections/cyberspace/view';

// ----------------------------------------------------------------------

export const metadata = { title: `پیشنهادها - ${CONFIG.appName}` };

export default function Page() {
  return <RecommendationsView />;
}
