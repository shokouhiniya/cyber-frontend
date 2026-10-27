// ----------------------------------------------------------------------

export const themeConfig = {
  /** **************************************
   * Base
   *************************************** */
  direction: 'rtl',
  defaultMode: 'light',
  modeStorageKey: 'theme-mode',
  classesPrefix: 'minimal',
  /** **************************************
   * Typography
   *************************************** */
  fontFamily: {
    // Brand font (self-hosted in public/fonts, see global.css); FaNum build, so digits are Persian
    primary: 'Yekan Bakh',
    secondary: 'Yekan Bakh',
  },
  /** **************************************
   * Palette
   *************************************** */
  palette: {
    // Brand palette (FRDD-DSGN-14040819-CLRPLT): org colour 1 (teal) and its tints/shades
    primary: {
      lighter: '#D9E7E6',
      light: '#8CB6B1',
      main: '#146A61',
      dark: '#0D403A',
      darker: '#082B27',
      contrastText: '#FFFFFF',
    },
    // Org colour 2 (amber)
    secondary: {
      lighter: '#FDDBA3',
      light: '#FBC15E',
      main: '#FAA61A',
      dark: '#C88515',
      darker: '#7D530D',
      contrastText: '#322105',
    },
    info: {
      lighter: '#CAFDF5',
      light: '#61F3F3',
      main: '#00B8D9',
      dark: '#006C9C',
      darker: '#003768',
      contrastText: '#FFFFFF',
    },
    success: {
      lighter: '#E6F7EE',
      light: '#66CA97',
      main: '#00A651',
      dark: '#007A3C',
      darker: '#004D26',
      contrastText: '#ffffff',
    },
    warning: {
      lighter: '#FFF5CC',
      light: '#FFD666',
      main: '#FFAB00',
      dark: '#B76E00',
      darker: '#7A4100',
      contrastText: '#1C252E',
    },
    error: {
      lighter: '#FEE9EA',
      light: '#F4777C',
      main: '#ED1C24',
      dark: '#B0141A',
      darker: '#6E0D10',
      contrastText: '#FFFFFF',
    },
    // Neutral scale built around the brand's text (#58595B, #A7A9AC) and border (#F1F2F2) greys
    grey: {
      50: '#FCFCFC',
      100: '#F8F9F9',
      200: '#F1F2F2',
      300: '#E2E3E4',
      400: '#C9CBCD',
      500: '#A7A9AC',
      600: '#7D7F82',
      700: '#58595B',
      800: '#2B2C2E',
      900: '#1A1B1C',
    },
    common: { black: '#000000', white: '#FFFFFF' },
  },
  /** **************************************
   * Css variables
   *************************************** */
  cssVariables: {
    cssVarPrefix: '',
    colorSchemeSelector: 'data-color-scheme',
  },
};
