'use client';

import { merge } from 'es-toolkit';
import { varAlpha } from 'minimal-shared/utils';
import { useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import { useTheme, useColorScheme } from '@mui/material/styles';
import IconButton, { iconButtonClasses } from '@mui/material/IconButton';

import { usePathname } from 'src/routes/hooks';

import { useAdminDesktopMode } from 'src/contexts/admin-desktop-mode';

import { Logo } from 'src/components/logo';
import { Iconify } from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';

import { useAuthContext } from 'src/auth/hooks';

import { NavMobile } from './nav-mobile';
import { BottomNav } from './bottom-nav';
import { VerticalDivider } from './content';
import { NavVertical } from './nav-vertical';
import { NavHorizontal } from './nav-horizontal';
import { MenuButton } from '../components/menu-button';
import { ProfileSwitcher } from '../components/profile-switcher';
import { navData as dashboardNavData } from '../nav-config-dashboard';
import { dashboardLayoutVars, dashboardNavColorVars } from './css-vars';
import { IngestRefreshButton } from '../components/ingest-refresh-button';
import { MainSection , layoutClasses , HeaderSection , LayoutSection } from '../core';

// ----------------------------------------------------------------------

export function DashboardLayout({ sx, cssVars, children, slotProps, layoutQuery = 'lg' }) {
  const theme = useTheme();
  const pathname = usePathname();
  const { mode, setMode } = useColorScheme();
  const { user } = useAuthContext();
  const settings = useSettingsContext();
  const { desktopMode, toggleDesktopMode } = useAdminDesktopMode();

  const isDark = mode === 'dark';
  const isAdminPage = pathname?.includes('/admin/');
  const showDesktopToggle = isAdminPage && user?.role === 'super_admin';

  // When desktop mode is active, use 'xs' as the breakpoint so sidebar
  // always shows and bottom nav always hides, regardless of screen width.
  const effectiveLayoutQuery = desktopMode && isAdminPage ? 'xs' : layoutQuery;

  const navVars = dashboardNavColorVars(theme, settings.state.navColor, settings.state.navLayout);

  const { value: open, onFalse: onClose, onTrue: onOpen } = useBoolean();

  const rawNavData = slotProps?.nav?.data ?? dashboardNavData;

  // Filter out entire groups whose every item is restricted to a role the
  // current user doesn't have. This removes the "مدیریت" subheader entirely
  // for non-super_admin users rather than leaving an empty heading.
  const navData = rawNavData
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        !item.allowedRoles || item.allowedRoles.includes(user?.role)
      ),
    }))
    .filter((group) => group.items.length > 0);

  const isNavMini = settings.state.navLayout === 'mini';
  const isNavHorizontal = settings.state.navLayout === 'horizontal';
  const isNavVertical = isNavMini || settings.state.navLayout === 'vertical';

  // Returns true = hide the item. allowedRoles is the list of roles that CAN see it.
  const canDisplayItemByRole = (allowedRoles) => {
    if (!allowedRoles) return false; // no restriction → always show
    return !allowedRoles.includes(user?.role);
  };

  const renderHeader = () => {
    const headerSlotProps = {
      container: {
        maxWidth: false,
        sx: {
          ...(isNavVertical && { px: { [effectiveLayoutQuery]: 5 } }),
          ...(isNavHorizontal && {
            bgcolor: 'var(--layout-nav-bg)',
            height: { [effectiveLayoutQuery]: 'var(--layout-nav-horizontal-height)' },
            [`& .${iconButtonClasses.root}`]: { color: 'var(--layout-nav-text-secondary-color)' },
          }),
        },
      },
    };

    const headerSlots = {
      bottomArea: isNavHorizontal ? (
        <NavHorizontal
          data={navData}
          layoutQuery={effectiveLayoutQuery}
          cssVars={navVars.section}
          checkPermissions={canDisplayItemByRole}
        />
      ) : null,
      leftArea: (
        <>
          {/** @slot Nav mobile */}
          <MenuButton
            onClick={onOpen}
            sx={{ mr: 1, ml: -1, [theme.breakpoints.up(effectiveLayoutQuery)]: { display: 'none' } }}
          />
          <NavMobile
            data={navData}
            open={open}
            onClose={onClose}
            cssVars={navVars.section}
            checkPermissions={canDisplayItemByRole}
          />

          {/** @slot Logo */}
          {isNavHorizontal && (
            <Logo
              sx={{
                display: 'none',
                [theme.breakpoints.up(effectiveLayoutQuery)]: { display: 'inline-flex' },
              }}
            />
          )}

          {/** @slot Divider */}
          {isNavHorizontal && (
            <VerticalDivider sx={{ [theme.breakpoints.up(effectiveLayoutQuery)]: { display: 'flex' } }} />
          )}
        </>
      ),
      rightArea: (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0, sm: 0.75 } }}>
          {/** @slot Ingest refresh */}
          <IngestRefreshButton />

          {/** @slot Desktop mode toggle — admin pages only */}
          {showDesktopToggle && (
            <Tooltip title={desktopMode ? 'بازگشت به نمای موبایل' : 'نمای دسکتاپ'}>
              <IconButton
                onClick={toggleDesktopMode}
                size="small"
                sx={{
                  color: desktopMode ? 'primary.main' : 'text.secondary',
                  bgcolor: desktopMode ? 'primary.lighter' : 'transparent',
                  border: '1px solid',
                  borderColor: desktopMode ? 'primary.light' : 'divider',
                  borderRadius: 1,
                  width: 34,
                  height: 34,
                }}
              >
                <Iconify
                  icon={desktopMode ? 'solar:monitor-bold' : 'solar:monitor-line-duotone'}
                  width={18}
                />
              </IconButton>
            </Tooltip>
          )}

          {/** @slot Dark mode toggle */}
          <Tooltip title={isDark ? 'حالت روشن' : 'حالت تاریک'}>
            <IconButton
              onClick={() => setMode(isDark ? 'light' : 'dark')}
              size="small"
              sx={{
                color: 'text.secondary',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                width: 34,
                height: 34,
              }}
            >
              <Iconify
                icon={isDark ? 'solar:sun-bold' : 'solar:moon-bold'}
                width={18}
              />
            </IconButton>
          </Tooltip>

          {/** @slot Profile switcher */}
          <ProfileSwitcher sx={{ mr: { xs: 0.5, sm: 1 } }} />
        </Box>
      ),
    };

    return (
      <HeaderSection
        layoutQuery={effectiveLayoutQuery}
        disableOffset
        disableElevation
        {...slotProps?.header}
        slots={{ ...headerSlots, ...slotProps?.header?.slots }}
        slotProps={merge(headerSlotProps, slotProps?.header?.slotProps ?? {})}
        sx={[
          (t) => ({
            backdropFilter: 'blur(20px)',
            backgroundColor: varAlpha(t.vars.palette.background.defaultChannel, 0.8),
          }),
          ...(Array.isArray(slotProps?.header?.sx) ? slotProps.header.sx : [slotProps?.header?.sx]),
        ]}
      />
    );
  };

  const renderSidebar = () => (
    <NavVertical
      data={navData}
      isNavMini={isNavMini}
      layoutQuery={effectiveLayoutQuery}
      cssVars={navVars.section}
      checkPermissions={canDisplayItemByRole}
      onToggleNav={() =>
        settings.setField(
          'navLayout',
          settings.state.navLayout === 'vertical' ? 'mini' : 'vertical'
        )
      }
    />
  );

  const renderFooter = () => <BottomNav />;

  const renderMain = () => <MainSection {...slotProps?.main}>{children}</MainSection>;

  return (
    <LayoutSection
      /** **************************************
       * @Header
       *************************************** */
      headerSection={renderHeader()}
      /** **************************************
       * @Sidebar
       *************************************** */
      sidebarSection={isNavHorizontal ? null : renderSidebar()}
      /** **************************************
       * @Footer
       *************************************** */
      footerSection={renderFooter()}
      /** **************************************
       * @Styles
       *************************************** */
      cssVars={{ ...dashboardLayoutVars(theme), ...navVars.layout, ...cssVars }}
      sx={[
        {
          [`& .${layoutClasses.sidebarContainer}`]: {
            [theme.breakpoints.up(effectiveLayoutQuery)]: {
              pl: isNavMini ? 'var(--layout-nav-mini-width)' : 'var(--layout-nav-vertical-width)',
              transition: theme.transitions.create(['padding-left'], {
                easing: 'var(--layout-transition-easing)',
                duration: 'var(--layout-transition-duration)',
              }),
            },
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {renderMain()}
    </LayoutSection>
  );
}
