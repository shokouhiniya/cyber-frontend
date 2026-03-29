import { CONFIG } from 'src/global-config';

import { ProfileView } from 'src/sections/cyberspace/view';

// ----------------------------------------------------------------------

export const metadata = { title: `پروفایل - ${CONFIG.appName}` };

export default function Page() {
  return <ProfileView />;
}
