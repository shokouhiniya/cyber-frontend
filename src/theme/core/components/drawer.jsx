import { varAlpha } from 'minimal-shared/utils';

import { UI_CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

const MuiDrawer = {
  defaultProps: {
    ModalProps: {
      container: () => UI_CONFIG.mobileOnly ? document.getElementById('drawer-container') : null
    }
  },
  /** **************************************
   * STYLE
   *************************************** */
  styleOverrides: {
    paperAnchorRight: ({ ownerState, theme }) => ({
      ...(ownerState.variant === 'temporary' && {
        ...theme.mixins.paperStyles(theme),
        boxShadow: `-40px 40px 80px -8px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.24)}`,
        ...theme.applyStyles('dark', {
          boxShadow: `-40px 40px 80px -8px ${varAlpha(theme.vars.palette.common.blackChannel, 0.24)}`,
        }),
      }),
    }),
    paperAnchorLeft: ({ ownerState, theme }) => ({
      ...(ownerState.variant === 'temporary' && {
        ...theme.mixins.paperStyles(theme),
        boxShadow: `40px 40px 80px -8px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.24)}`,
        ...theme.applyStyles('dark', {
          boxShadow: `40px 40px 80px -8px  ${varAlpha(theme.vars.palette.common.blackChannel, 0.24)}`,
        }),
      }),
    }),
  },
};

// ----------------------------------------------------------------------

export const drawer = { MuiDrawer };
