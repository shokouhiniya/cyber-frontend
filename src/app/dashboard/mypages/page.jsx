import { CONFIG } from 'src/global-config';

import { MyPagesView } from 'src/sections/cyberspace/view';

// ----------------------------------------------------------------------

export const metadata = { title: `رسانه - ${CONFIG.appName}` };

export default function Page() {
  return <MyPagesView />;
}
