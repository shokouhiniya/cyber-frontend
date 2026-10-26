'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Badge from '@mui/material/Badge';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Popover from '@mui/material/Popover';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import ListItemButton from '@mui/material/ListItemButton';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import { fNum, fRelativeFa } from 'src/utils/format-number-fa';

import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from 'src/api/notifications';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { useProfileScope } from 'src/auth/hooks';

// ----------------------------------------------------------------------

function typeVisual(n) {
  switch (n.type) {
    case 'crisis_level':
      if (n.meta?.level === 'critical') return { icon: 'solar:danger-triangle-bold', color: 'error' };
      if (n.meta?.level === 'warning') return { icon: 'solar:danger-triangle-bold', color: 'warning' };
      return { icon: 'solar:shield-check-bold', color: 'success' };
    case 'ingest_completed':
      return { icon: 'solar:check-circle-bold', color: 'success' };
    case 'ingest_failed':
      return { icon: 'solar:shield-warning-bold', color: 'error' };
    case 'data_stale':
      return { icon: 'solar:clock-circle-bold', color: 'warning' };
    default:
      return { icon: 'solar:bell-bing-bold', color: 'info' };
  }
}

function badgeLabel(count) {
  return count > 99 ? `${fNum(99)}+` : fNum(count);
}

// ----------------------------------------------------------------------

export function NotificationsPopover({ sx }) {
  const theme = useTheme();
  const router = useRouter();
  const { profiles, activeProfileId, selectProfile } = useProfileScope();

  const [anchorEl, setAnchorEl] = useState(null);

  const { data, isLoading, isError } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const items = data?.items ?? [];
  const unread = data?.unreadCount ?? 0;

  const handleItemClick = (n) => {
    if (!n.readAt) markRead.mutate(n.id);
    if (!n.link) return;
    setAnchorEl(null);
    // Profile-scoped notification for another profile: switch to it first so the
    // link opens on the right data.
    if (n.profileId && n.profileId !== activeProfileId && profiles?.some((p) => p.id === n.profileId)) {
      selectProfile(n.profileId);
    }
    router.push(n.link);
  };

  const handleReadAll = () =>
    markAll.mutate(undefined, {
      onError: (err) => toast.error(typeof err === 'string' ? err : 'خطا در به‌روزرسانی اعلان‌ها'),
    });

  const renderList = () => {
    if (isLoading) {
      return (
        <Box sx={{ py: 5, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress size={24} />
        </Box>
      );
    }

    if (isError || !items.length) {
      return (
        <Stack spacing={1} sx={{ py: 5, px: 3, alignItems: 'center', textAlign: 'center', color: 'text.disabled' }}>
          <Iconify icon={isError ? 'solar:bell-off-bold' : 'solar:inbox-bold'} width={40} />
          <Typography variant="body2">
            {isError ? 'دریافت اعلان‌ها ممکن نشد' : 'اعلانی وجود ندارد'}
          </Typography>
        </Stack>
      );
    }

    return (
      <List disablePadding sx={{ maxHeight: { xs: '60vh', sm: 420 }, overflowY: 'auto' }}>
        {items.map((n) => {
          const { icon, color } = typeVisual(n);
          const isUnread = !n.readAt;
          return (
            <ListItemButton
              key={n.id}
              onClick={() => handleItemClick(n)}
              sx={{
                gap: 1.5,
                py: 1.5,
                px: 2,
                alignItems: 'flex-start',
                borderBottom: `1px dashed ${theme.vars.palette.divider}`,
                ...(isUnread && { bgcolor: alpha(theme.palette.primary.main, 0.06) }),
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  flexShrink: 0,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: `${color}.main`,
                  bgcolor: alpha(theme.palette[color].main, 0.12),
                }}
              >
                <Iconify icon={icon} width={20} />
              </Box>

              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: isUnread ? 700 : 500 }}>
                  {n.title}
                </Typography>
                {n.body && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      mt: 0.25,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {n.body}
                  </Typography>
                )}
                <Typography variant="caption" sx={{ color: 'text.disabled', mt: 0.5, display: 'block' }}>
                  {fRelativeFa(n.createdAt)}
                </Typography>
              </Box>

              {isUnread && (
                <Box
                  sx={{ width: 8, height: 8, mt: 0.75, flexShrink: 0, borderRadius: '50%', bgcolor: 'info.main' }}
                />
              )}
            </ListItemButton>
          );
        })}
      </List>
    );
  };

  return (
    <>
      <Tooltip title="اعلان‌ها">
        <IconButton
          onClick={(e) => setAnchorEl(e.currentTarget)}
          size="small"
          aria-label={unread ? `اعلان‌ها، ${fNum(unread)} خوانده‌نشده` : 'اعلان‌ها'}
          sx={[
            {
              color: anchorEl ? 'primary.main' : 'text.secondary',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              width: 34,
              height: 34,
            },
            ...(Array.isArray(sx) ? sx : [sx]),
          ]}
        >
          <Badge
            badgeContent={unread ? badgeLabel(unread) : 0}
            color="error"
            sx={{ '& .MuiBadge-badge': { fontSize: 10, height: 16, minWidth: 16, px: 0.5 } }}
          >
            <Iconify icon="solar:bell-bing-bold" width={18} />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        slotProps={{
          paper: {
            sx: { mt: 1, width: 380, maxWidth: 'calc(100vw - 32px)', overflow: 'hidden' },
          },
        }}
      >
        <Stack direction="row" sx={{ alignItems: 'center', px: 2, py: 1.5, gap: 1 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1">اعلان‌ها</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {unread ? `${fNum(unread)} اعلان خوانده‌نشده` : 'همه خوانده شده'}
            </Typography>
          </Box>
          {unread > 0 && (
            <Button
              size="small"
              color="primary"
              onClick={handleReadAll}
              disabled={markAll.isPending}
              startIcon={<Iconify icon="solar:check-read-bold" width={18} />}
            >
              خواندن همه
            </Button>
          )}
        </Stack>
        <Divider />
        {renderList()}
      </Popover>
    </>
  );
}
