'use client';

import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';

import { Scrollbar } from 'src/components/scrollbar';

import { UI_CONFIG } from '../global-config';

const DESKTOP_MODE_KEY = 'admin_desktop_mode';

function ScreenSize({ children }) {
  const [isDesktopSize, setIsDesktopSize] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [adminDesktopMode, setAdminDesktopMode] = useState(false);
  const [isAdminPage, setIsAdminPage] = useState(false);

  useEffect(() => {
    setHasMounted(true);

    if (typeof document !== 'undefined' && document.querySelector) {
      const bodySize = document.querySelector('body')?.getBoundingClientRect();
      setIsDesktopSize(bodySize?.width > 600);
    }

    // Read desktop mode preference from localStorage
    try {
      setAdminDesktopMode(localStorage.getItem(DESKTOP_MODE_KEY) === 'true');
    } catch { /* ignore */ }

    // Check if current page is an admin page
    setIsAdminPage(window.location.pathname.includes('/admin/'));

    // Listen for storage changes (when toggle is clicked — same tab via dispatchEvent)
    const onStorage = (e) => {
      if (e.key === DESKTOP_MODE_KEY) {
        setAdminDesktopMode(e.newValue === 'true');
      }
    };
    window.addEventListener('storage', onStorage);

    // Poll pathname for Next.js soft navigations (popstate doesn't fire for them)
    let lastPath = window.location.pathname;
    const pathInterval = setInterval(() => {
      const current = window.location.pathname;
      if (current !== lastPath) {
        lastPath = current;
        setIsAdminPage(current.includes('/admin/'));
      }
    }, 300);

    return () => {
      window.removeEventListener('storage', onStorage);
      clearInterval(pathInterval);
    };
  }, []);

  if (!hasMounted) {
    return null;
  }

  // Bypass the mobile frame when desktop mode is active on admin pages
  const forceMobileFrame = isDesktopSize && UI_CONFIG.mobileOnly && !(adminDesktopMode && isAdminPage);

  return (
    <Box
      sx={
        forceMobileFrame
          ? {
              height: '100dvh',
              width: 500,
              maxWidth: 550,
              margin: '0 auto',
              transform: 'translateZ(0px)',
              overflow: 'hidden',
              boxShadow: '0 0 16px rgba(0,0,0,0.1)',
              bgcolor: 'background.default',
            }
          : {
              bgcolor: 'background.default',
              minHeight: '100vh',
            }
      }
    >
      <Scrollbar
        id="scroll-target"
        slotProps={{
          content: {
            minHeight: '100%',
            display: 'flex',
          },
          contentWrapper: {
            direction: 'ltr',
            textAlign: 'left',
          },
        }}
        sx={{
          position: 'relative',
          zIndex: 1,

          // background: '#fff',
          height: '100dvh',

          // overflowY: 'auto',
          // overflowX: 'hidden',
          // '::-webkit-scrollbar': {
          //   height: 6,
          //   width: 6,
          //   background: '#dcdcdc',
          // },
          //
          // '::-webkit-scrollbar-thumb': {
          //   background: '#949494',
          //   '-webkit-border-radius': '1ex',
          // },
          //
          // '::-webkit-scrollbar-corner': {
          //   background: '#d3d3d3',
          // },
        }}
      >
        {children}
      </Scrollbar>
      <Box
        id="drawer-container"
        style={{
          direction: 'rtl',
        }}
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,

          '& *': {
            direction: 'ltr',
          },
        }}
      />
      <Box
        id="drawer-left-container"
        style={{
          direction: 'rtl',
        }}
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          top: 0,
          right: 0,

          '& *': {
            direction: 'ltr',
          },
        }}
      />
    </Box>
  );
}

export default ScreenSize;
