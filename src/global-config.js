import { paths } from 'src/routes/paths';

import packageJson from '../package.json';

// ----------------------------------------------------------------------

export const UI_CONFIG = {
  workspaces: false,
  helpLink: false,
  localization: false,
  notification: false,
  searchbar: false,
  contacts: false,
  settings: false,
  account: true,
  mobileOnly: true,
}

export const CONFIG = {
  appName: 'داشبورد فضای مجازی',
  appVersion: packageJson.version,
  serverUrl: process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000',
  assetsDir: process.env.NEXT_PUBLIC_ASSETS_DIR ?? '',
  isStaticExport: JSON.parse(process.env.BUILD_STATIC_EXPORT ?? 'false'),
  auth: {
    method: 'jwt',
    skip: false,
    redirectPath: paths.dashboard.root,
  },
};
