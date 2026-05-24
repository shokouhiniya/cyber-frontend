import 'src/global.css';

import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';

import { CONFIG } from 'src/global-config';
import { primary } from 'src/theme/core/palette';
import ScreenSize from 'src/layouts/screen-size';
import { themeConfig, ThemeProvider } from 'src/theme';
import { I18nProvider, LocalizationProvider } from 'src/locales';

import { ProgressBar } from 'src/components/progress-bar';
import { MotionLazy } from 'src/components/animate/motion-lazy';
import { detectSettings } from 'src/components/settings/server';
import { defaultSettings, SettingsProvider } from 'src/components/settings';

import { AuthProvider } from 'src/auth/context/jwt';

import Providers from './providers';

// ----------------------------------------------------------------------

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: primary.main,
};

export const metadata = {
  icons: [
    {
      rel: 'icon',
      url: `${CONFIG.assetsDir}/favicon.ico`,
    },
  ],
};

// ----------------------------------------------------------------------

async function getAppConfig() {
  if (CONFIG.isStaticExport) {
    return {
      cookieSettings: undefined,
      dir: defaultSettings.direction,
    };
  } else {
    const [settings] = await Promise.all([detectSettings()]);

    return {
      cookieSettings: settings,
      dir: settings.direction,
    };
  }
}

export default async function RootLayout({ children }) {
  const appConfig = await getAppConfig();

  return (
    <html lang="en" dir={appConfig.dir} suppressHydrationWarning>
      <body>
        <InitColorSchemeScript
          modeStorageKey={themeConfig.modeStorageKey}
          attribute={themeConfig.cssVariables.colorSchemeSelector}
          defaultMode={themeConfig.enableSystemMode ? 'system' : themeConfig.defaultMode}
        />

        <I18nProvider>
          <Providers>
            <AuthProvider>
              <LocalizationProvider>
                <SettingsProvider
                  cookieSettings={appConfig.cookieSettings}
                  defaultSettings={defaultSettings}
                >
                  <AppRouterCacheProvider options={{ key: 'css' }}>
                    <ThemeProvider
                      modeStorageKey={themeConfig.modeStorageKey}
                      defaultMode={themeConfig.enableSystemMode ? 'system' : themeConfig.defaultMode}
                    >
                      <MotionLazy>
                        <ScreenSize>
                          <ProgressBar />
                          {children}
                        </ScreenSize>
                      </MotionLazy>
                    </ThemeProvider>
                  </AppRouterCacheProvider>
                </SettingsProvider>
              </LocalizationProvider>
            </AuthProvider>
          </Providers>
        </I18nProvider>
      </body>
    </html>
  );
}
