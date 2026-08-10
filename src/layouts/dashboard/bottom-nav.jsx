'use client';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { alpha, useTheme } from '@mui/material/styles';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';

import { paths } from 'src/routes/paths';
import { useRouter, usePathname } from 'src/routes/hooks';

import { useAdminDesktopMode } from 'src/contexts/admin-desktop-mode';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const TABS = [
  { value: paths.dashboard.root, label: 'داشبورد', icon: 'solar:home-2-bold-duotone' },
  { value: paths.dashboard.mypages, label: 'رسانه', icon: 'solar:shield-check-bold-duotone' },
  { value: paths.dashboard.posts, label: 'پست‌ها', icon: 'solar:chat-round-line-bold-duotone' },
  { value: paths.dashboard.analytics, label: 'تحلیل', icon: 'solar:graph-bold-duotone' },
  { value: paths.dashboard.recommendations, label: 'پیشنهادها', icon: 'solar:lightbulb-bolt-bold-duotone' },
];

// ----------------------------------------------------------------------

function resolveTab(pathname) {
  const clean = pathname.replace(/\/+$/, '') || '/';

  // Exact match first (for root)
  const exact = TABS.find((tab) => tab.value.replace(/\/+$/, '') === clean);
  if (exact) return exact.value;

  // startsWith match for nested routes
  const match = TABS.slice()
    .reverse()
    .find((tab) => tab.value !== paths.dashboard.root && clean.startsWith(tab.value));

  return match?.value || TABS[0].value;
}

// ----------------------------------------------------------------------

export function BottomNav() {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { desktopMode } = useAdminDesktopMode();

  const isAdminPage = pathname?.includes('/admin/');
  const currentTab = resolveTab(pathname);

  const handleChange = (_event, newValue) => {
    router.push(newValue);
  };

  // Hide on desktop mode when on admin pages
  if (desktopMode && isAdminPage) return null;

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: theme.zIndex.appBar + 1,
        borderRadius: 0,
        boxShadow: `0 -4px 20px ${alpha(theme.palette.grey[500], 0.16)}`,
        display: { xs: 'block', lg: 'none' },
      }}
      elevation={3}
    >
      <BottomNavigation
        value={currentTab}
        onChange={handleChange}
        showLabels
        sx={{
          height: 70,
          bgcolor: 'background.paper',
          '& .MuiBottomNavigationAction-root': {
            minWidth: 'auto',
            padding: '6px 8px 8px',
            '&.Mui-selected': {
              color: theme.palette.primary.main,
              '& .MuiBottomNavigationAction-label': { fontSize: 11, fontWeight: 700 },
            },
            '&:not(.Mui-selected)': { color: 'text.secondary' },
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: 10,
            fontWeight: 600,
            marginTop: 0.5,
          },
        }}
      >
        {TABS.map((tab) => (
          <BottomNavigationAction
            key={tab.value}
            value={tab.value}
            label={tab.label}
            icon={
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  ...(currentTab === tab.value && {
                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                  }),
                }}
              >
                <Iconify icon={tab.icon} width={22} />
              </Box>
            }
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
