'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import Avatar from '@mui/material/Avatar';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import ListItemText from '@mui/material/ListItemText';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

import { useAuthContext, useProfileScope } from 'src/auth/hooks';

// ----------------------------------------------------------------------

// Sort profiles by sort_name (family name) — provided by the backend.
// Falls back to last word of name if sort_name is missing.
function getSortKey(profile) {
  if (profile.sortName) return profile.sortName;
  const parts = (profile.name || '').trim().split(/\s+/);
  return parts[parts.length - 1];
}

export function ProfileSwitcher({ sx }) {
  const theme = useTheme();
  const { user } = useAuthContext();
  const { profiles, activeProfile, selectProfile, canSwitch } = useProfileScope();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  if (!profiles?.length) return null;

  const isSuperAdmin = user?.role === 'super_admin';

  // Backend already returns sorted, but sort client-side too as a safety net
  const sortedProfiles = [...profiles].sort((a, b) =>
    getSortKey(a).localeCompare(getSortKey(b), 'fa')
  );

  return (
    <>
      <ButtonBase
        disabled={!canSwitch}
        onClick={(e) => canSwitch && setAnchorEl(e.currentTarget)}
        sx={[
          {
            px: 1,
            py: 0.5,
            borderRadius: 1,
            gap: 1,
            display: 'flex',
            alignItems: 'center',
            '&:hover': canSwitch ? { bgcolor: alpha(theme.palette.grey[500], 0.12) } : undefined,
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        <Avatar
          src={activeProfile?.avatar}
          sx={{
            width: 28,
            height: 28,
            fontSize: 14,
            bgcolor: activeProfile?.primaryColor || 'primary.main',
          }}
        >
          {activeProfile?.name?.charAt(0) || '؟'}
        </Avatar>
        <Box sx={{ textAlign: 'start', minWidth: 0, display: { xs: 'none', sm: 'block' } }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
            {isSuperAdmin ? 'در حال مشاهده به عنوان' : 'پروفایل'}
          </Typography>
          <Typography variant="subtitle2" noWrap sx={{ maxWidth: 180 }}>
            {activeProfile?.name || '—'}
          </Typography>
        </Box>
        {canSwitch && <Iconify icon="eva:chevron-down-fill" width={18} />}
        {isSuperAdmin && (
          <Chip size="small" color="primary" label="ادمین" sx={{ ml: 0.5, height: 20 }} />
        )}
      </ButtonBase>

      <Menu
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: { minWidth: 240, mt: 0.5 } } }}
      >
        {sortedProfiles.map((p) => {
          const selected = p.id === activeProfile?.id;
          return (
            <MenuItem
              key={p.id}
              selected={selected}
              onClick={() => {
                selectProfile(p.id);
                setAnchorEl(null);
              }}
            >
              <Avatar
                src={p.avatar}
                sx={{
                  width: 28,
                  height: 28,
                  mr: 1.5,
                  fontSize: 13,
                  bgcolor: p.primaryColor || 'primary.main',
                }}
              >
                {p.name?.charAt(0)}
              </Avatar>
              <ListItemText
                primary={p.name}
                secondary={p.organization || p.role}
                slotProps={{
                  primary: { noWrap: true, variant: 'subtitle2' },
                  secondary: { noWrap: true, variant: 'caption' },
                }}
              />
              {selected && <Iconify icon="eva:checkmark-fill" width={18} sx={{ ml: 1, color: 'primary.main' }} />}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}
