import { CONFIG } from 'src/global-config';

import { NotFoundView } from 'src/sections/error';

// ----------------------------------------------------------------------

export const metadata = { title: `صفحه پیدا نشد - ${CONFIG.appName}` };

export default function Page() {
  return <NotFoundView />;
}
