'use client';

import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import Avatar from '@mui/material/Avatar';
import Popover from '@mui/material/Popover';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import ListItemText from '@mui/material/ListItemText';
import { alpha, useTheme } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';
import ListItemButton from '@mui/material/ListItemButton';

import { Iconify } from 'src/components/iconify';

import { useAuthContext, useProfileScope } from 'src/auth/hooks';

// ----------------------------------------------------------------------

/** Show a search box once the list is at least this long. */
const SEARCH_THRESHOLD = 7;

// Sort key: sort_name (family name) from the backend, falling back to the last
// word of name if sort_name is missing.
function getSortKey(profile) {
  if (profile.sortName) return profile.sortName;
  const parts = (profile.name || '').trim().split(/\s+/);
  return parts[parts.length - 1];
}

/** Priority presets used by the admin form (ویژه / بالا / عادی). */
function priorityTag(priority) {
  if (priority >= 100) return { label: 'ویژه', color: 'warning', icon: 'solar:star-bold' };
  if (priority >= 50) return { label: 'بالا', color: 'info', icon: 'solar:star-bold-duotone' };
  return null;
}

// Fold Arabic letter variants so «علي» matches «علی».
const normalize = (s) =>
  (s || '').replace(/ي/g, 'ی').replace(/ك/g, 'ک').toLowerCase().trim();

export function ProfileSwitcher({ sx }) {
  const theme = useTheme();
  const { user } = useAuthContext();
  const { profiles, activeProfile, selectProfile, canSwitch } = useProfileScope();

  const [anchorEl, setAnchorEl] = useState(null);
  const [query, setQuery] = useState('');
  const open = Boolean(anchorEl);

  // Backend already returns priority DESC, sort_name ASC — sort client-side too as a safety net.
  const sortedProfiles = useMemo(
    () =>
      [...(profiles ?? [])].sort(
        (a, b) =>
          (b.priority ?? 0) - (a.priority ?? 0) || getSortKey(a).localeCompare(getSortKey(b), 'fa')
      ),
    [profiles]
  );

  const filtered = useMemo(() => {
    const q = normalize(query);
    if (!q) return sortedProfiles;
    return sortedProfiles.filter((p) =>
      [p.name, p.sortName, p.organization, p.role].some((f) => normalize(f).includes(q))
    );
  }, [sortedProfiles, query]);

  if (!profiles?.length) return null;

  const isSuperAdmin = user?.role === 'super_admin';
  const showSearch = sortedProfiles.length >= SEARCH_THRESHOLD;

  const handleClose = () => {
    setAnchorEl(null);
    setQuery('');
  };

  return (
    <>
      <ButtonBase
        disabled={!canSwitch}
        onClick={(e) => canSwitch && setAnchorEl(e.currentTarget)}
        sx={[
          {
            px: { xs: 0.5, sm: 1 },
            py: 0.5,
            borderRadius: 1,
            gap: { xs: 0.5, sm: 1 },
            display: 'flex',
            alignItems: 'center',
            minWidth: 0,
            '&:hover': canSwitch ? { bgcolor: alpha(theme.palette.grey[500], 0.12) } : undefined,
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        <Avatar
          src={activeProfile?.avatar || undefined}
          alt={activeProfile?.name}
          sx={{
            width: 34,
            height: 34,
            fontSize: 15,
            bgcolor: activeProfile?.primaryColor || 'primary.main',
            color: 'common.white',
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
          <Chip
            size="small"
            color="primary"
            label="ادمین"
            sx={{ ml: 0.5, height: 20, display: { xs: 'none', sm: 'inline-flex' } }}
          />
        )}
      </ButtonBase>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: { sx: { mt: 0.5, width: 300, maxWidth: 'calc(100vw - 32px)', overflow: 'hidden' } },
        }}
      >
        {showSearch && (
          <Box sx={{ p: 1.5, pb: 1 }}>
            <TextField
              autoFocus
              fullWidth
              size="small"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جستجوی پروفایل…"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="eva:search-fill" width={18} sx={{ color: 'text.disabled' }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>
        )}

        <List disablePadding sx={{ maxHeight: { xs: '60vh', sm: 420 }, overflowY: 'auto', py: 0.5 }}>
          {filtered.map((p) => {
            const selected = p.id === activeProfile?.id;
            const tag = priorityTag(p.priority ?? 0);
            return (
              <ListItemButton
                key={p.id}
                selected={selected}
                onClick={() => {
                  selectProfile(p.id);
                  handleClose();
                }}
                sx={{ gap: 1.5, py: 1, px: 1.5, mx: 0.5, borderRadius: 1 }}
              >
                <Avatar
                  src={p.avatar || undefined}
                  alt={p.name}
                  sx={{ width: 40, height: 40, fontSize: 16, color: 'common.white', bgcolor: p.primaryColor || 'primary.main' }}
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
                  sx={{ minWidth: 0 }}
                />
                {tag && (
                  <Tooltip title={`اولویت ${tag.label}`}>
                    <Iconify icon={tag.icon} width={16} sx={{ color: `${tag.color}.main`, flexShrink: 0 }} />
                  </Tooltip>
                )}
                {selected && (
                  <Iconify icon="eva:checkmark-fill" width={18} sx={{ color: 'primary.main', flexShrink: 0 }} />
                )}
              </ListItemButton>
            );
          })}

          {!filtered.length && (
            <Typography variant="body2" sx={{ py: 3, textAlign: 'center', color: 'text.disabled' }}>
              پروفایلی یافت نشد
            </Typography>
          )}
        </List>
      </Popover>
    </>
  );
}
