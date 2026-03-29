import { CONFIG } from 'src/global-config';

import { PostsView } from 'src/sections/cyberspace/view';

// ----------------------------------------------------------------------

export const metadata = { title: `پست‌ها - ${CONFIG.appName}` };

export default function Page() {
  return <PostsView />;
}
