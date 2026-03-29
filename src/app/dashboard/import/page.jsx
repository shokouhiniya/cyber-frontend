import { CONFIG } from 'src/global-config';

import { ImportView } from 'src/sections/cyberspace/view/import/import-view';

// ----------------------------------------------------------------------

export const metadata = { title: `ایمپورت داده - ${CONFIG.appName}` };

export default function Page() {
  return <ImportView />;
}
