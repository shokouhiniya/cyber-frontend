'use client';

import { createTheme as createMuiTheme } from '@mui/material/styles';

import breakpoints from './breakpoints';
import { themeConfig } from './theme-config';
import { updateCoreWithSettings, updateComponentsWithSettings } from './with-settings';
import { mixins , shadows , palette , components , typography , customShadows } from './core';

// ----------------------------------------------------------------------

export const baseTheme = {
  colorSchemes: {
    light: {
      palette: palette.light,
      shadows: shadows.light,
      customShadows: customShadows.light,
    },
    dark: {
      palette: palette.dark,
      shadows: shadows.dark,
      customShadows: customShadows.dark,
    },
  },
  breakpoints,
  mixins,
  components,
  typography,
  shape: { borderRadius: 8 },
  direction: themeConfig.direction,
  cssVariables: themeConfig.cssVariables,
  defaultColorScheme: themeConfig.defaultMode,
};

// ----------------------------------------------------------------------

export function createTheme({ settingsState, themeOverrides = {}, localeComponents = {} } = {}) {
  // Update core theme settings
  const updatedCore = settingsState ? updateCoreWithSettings(baseTheme, settingsState) : baseTheme;

  // Update component settings
  const updatedComponents = settingsState
    ? updateComponentsWithSettings(components, settingsState)
    : {};

  // Create and return the final theme
  const theme = createMuiTheme(updatedCore, updatedComponents, localeComponents, themeOverrides);

  return theme;
}
