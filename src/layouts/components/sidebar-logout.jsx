'use client';

import { useCallback } from 'react';

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import { alpha } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';

import { useAuthContext } from 'src/auth/hooks';
import { signOut } from 'src/auth/context/jwt/action';

// ----------------------------------------------------------------------

/**
 * Renders a compact "current user + logout" footer at the bottom of the sidebar.
 * Used in place of the AccountDrawer/avatar that lived in the dashboard header.
 */
export function SidebarLogout({ sx }) {
  const router = useRouter();
  const { user, checkUserSession } = useAuthContext();

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
      await checkUserSession?.();
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  }, [checkUserSession, router]);

  if (!user) return null;

  const displayName = user.name || user.email || user.username;
  const initial = (displayName || '؟').charAt(0).toUpperCase();
  const roleLabel =
    user.role === 'super_admin' ? 'سوپر ادمین' :
    user.role === 'client_admin' ? 'مدیر' :
    user.role === 'client_viewer' ? 'بیننده' : '';

  return (
    <Box
      sx={[
        (theme) => ({
          mx: 2,
          mb: 2,
          mt: 'auto',
          p: 1.25,
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          borderRadius: 1.5,
          bgcolor: alpha(theme.palette.grey[500], 0.06),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Avatar
        src={user.avatar}
        alt={displayName}
        sx={{ width: 36, height: 36, fontSize: 14, fontWeight: 700 }}
      >
        {initial}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle2" noWrap sx={{ fontSize: 12, fontWeight: 700 }}>
          {displayName}
        </Typography>
        {roleLabel && (
          <Typography variant="caption" color="text.disabled" noWrap sx={{ fontSize: 10 }}>
            {roleLabel}
          </Typography>
        )}
      </Box>
      <IconButton
        size="small"
        color="error"
        onClick={handleLogout}
        title="خروج از حساب"
        sx={{ flexShrink: 0 }}
      >
        <Iconify icon="solar:logout-2-bold-duotone" width={20} />
      </IconButton>
    </Box>
  );
}
