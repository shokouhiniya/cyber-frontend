'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

import { ProfileFormDialog } from 'src/sections/admin/profiles/profile-form-dialog';

import { useAuthContext } from 'src/auth/hooks';

import { ChangePasswordDialog } from './change-password-dialog';

// ----------------------------------------------------------------------

const PLATFORM_ICONS = {
  telegram:  { icon: 'ic:baseline-telegram',                   color: '#0088cc', label: 'تلگرام' },
  twitter:   { icon: 'ri:twitter-x-fill',                      color: '#000000', label: 'ایکس' },
  x:         { icon: 'ri:twitter-x-fill',                      color: '#000000', label: 'ایکس' },
  instagram: { icon: 'mdi:instagram',                          color: '#E4405F', label: 'اینستاگرام' },
  news:      { icon: 'solar:document-text-bold',               color: '#4CAF50', label: 'خبرگزاری' },
  newspaper: { icon: 'solar:global-bold-duotone',              color: '#78909C', label: 'روزنامه' },
  bale:      { icon: 'solar:chat-round-bold',                  color: '#00A86B', label: 'بله' },
  rubika:    { icon: 'solar:chat-square-bold',                 color: '#7C3AED', label: 'روبیکا' },
  eitaa:     { icon: 'solar:chat-line-bold',                   color: '#F57C00', label: 'ایتا' },
  aparat:    { icon: 'solar:videocamera-record-bold-duotone',  color: '#FF5722', label: 'آپارات' },
  web:       { icon: 'solar:global-bold-duotone',              color: '#637381', label: 'وب' },
};

// ----------------------------------------------------------------------

export function PageProfile({ profileData, rawProfile, loading }) {
  const theme = useTheme();
  const { user } = useAuthContext();
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const [editOpen, setEditOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);

  if (loading) {
    return (
      <Stack spacing={2.5} sx={{ pb: 10 }}>
        <Card sx={{ p: 3, borderRadius: 2.5 }}>
          <Typography>در حال بارگذاری...</Typography>
        </Card>
      </Stack>
    );
  }

  const channels = profileData?.officialChannels || [];
  const keywords = profileData?.keywords || [];

  return (
    <>
      <Stack spacing={2.5} sx={{ pb: 10 }}>
        {/* Profile Header */}
        <Card sx={{ borderRadius: 2.5, overflow: 'hidden', boxShadow: theme.shadows[8] }}>
          {/* Cover */}
          <Box
            sx={{
              height: 120,
              background: `linear-gradient(135deg, ${profileData?.primaryColor || theme.palette.primary.main} 0%, ${alpha(profileData?.primaryColor || theme.palette.primary.dark, 0.7)} 100%)`,
              position: 'relative',
            }}
          />

          {/* Avatar & Info */}
          <Box sx={{ p: 3, mt: -6 }}>
            <Stack spacing={2}>
              <Stack direction="row" alignItems="flex-end" justifyContent="space-between">
                <Avatar
                  src={profileData?.avatar || undefined}
                  sx={{
                    width: 100,
                    height: 100,
                    border: `4px solid ${theme.palette.background.paper}`,
                    boxShadow: theme.shadows[8],
                    fontSize: 36,
                    fontWeight: 700,
                    bgcolor: alpha(profileData?.primaryColor || theme.palette.primary.main, 0.16),
                    color: profileData?.primaryColor || theme.palette.primary.main,
                  }}
                >
                  {profileData?.name?.charAt(0) || 'م'}
                </Avatar>

                {isAdmin && (
                  <Tooltip title="ویرایش پروفایل">
                    <IconButton
                      size="small"
                      onClick={() => setEditOpen(true)}
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.16) },
                      }}
                    >
                      <Iconify icon="solar:pen-bold" width={18} sx={{ color: 'primary.main' }} />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>

              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
                  {profileData?.name || '—'}
                </Typography>
                {profileData?.role && (
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                    {profileData.role}
                  </Typography>
                )}
                {profileData?.organization && (
                  <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                    {profileData.organization}
                  </Typography>
                )}
              </Box>

              {/* Keywords */}
              {keywords.length > 0 && (
                <Stack direction="row" flexWrap="wrap" gap={0.75}>
                  {keywords.map((kw) => (
                    <Chip
                      key={kw}
                      label={kw}
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: 11,
                        bgcolor: alpha(profileData?.primaryColor || theme.palette.primary.main, 0.08),
                        color: profileData?.primaryColor || theme.palette.primary.main,
                        border: `1px solid ${alpha(profileData?.primaryColor || theme.palette.primary.main, 0.2)}`,
                      }}
                    />
                  ))}
                </Stack>
              )}
            </Stack>
          </Box>
        </Card>

        {/* Official Channels */}
        {channels.length > 0 && (
          <Card sx={{ p: 3, borderRadius: 2.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
              کانال‌ها و صفحات رسمی
            </Typography>
            <Stack spacing={1.5}>
              {channels.map((ch, i) => {
                const platform = PLATFORM_ICONS[ch.platform] || PLATFORM_ICONS[ch.sourceType] || { icon: 'solar:link-bold', color: '#637381', label: ch.platform || ch.sourceType || '?' };
                return (
                  <Stack key={i} direction="row" alignItems="center" spacing={1.5}>
                    <Box
                      sx={{
                        width: 36, height: 36, borderRadius: 1.5,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        bgcolor: alpha(platform.color, 0.1),
                        flexShrink: 0,
                      }}
                    >
                      <Iconify icon={platform.icon} width={20} sx={{ color: platform.color }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {ch.name || ch.handle || platform.label}
                      </Typography>
                      {ch.handle && (
                        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                          @{ch.handle.replace(/^@/, '')}
                        </Typography>
                      )}
                    </Box>
                    <Chip
                      label={platform.label}
                      size="small"
                      sx={{
                        height: 20, fontSize: 10,
                        bgcolor: alpha(platform.color, 0.08),
                        color: platform.color,
                        border: `1px solid ${alpha(platform.color, 0.2)}`,
                      }}
                    />
                  </Stack>
                );
              })}
            </Stack>
          </Card>
        )}

        {/* Profile metadata */}
        {(profileData?.lastUpdate || profileData?.tier) && (
          <Card sx={{ p: 3, borderRadius: 2.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
              اطلاعات سیستمی
            </Typography>
            <Stack spacing={1} divider={<Divider flexItem />}>
              {profileData?.tier && (
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">سطح پروفایل</Typography>
                  <Chip
                    label={profileData.tier === 'heavy' ? 'سنگین' : profileData.tier === 'light' ? 'سبک' : 'متوسط'}
                    size="small"
                    color={profileData.tier === 'heavy' ? 'error' : profileData.tier === 'light' ? 'success' : 'warning'}
                    variant="outlined"
                  />
                </Stack>
              )}
              {profileData?.lastUpdate && (
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">آخرین به‌روزرسانی</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{profileData.lastUpdate}</Typography>
                </Stack>
              )}
            </Stack>
          </Card>
        )}

        {/* Account settings — available to anyone signed in */}
        <Card sx={{ p: 3, borderRadius: 2.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
            تنظیمات حساب کاربری
          </Typography>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => setPwOpen(true)}
            startIcon={<Iconify icon="solar:lock-password-bold-duotone" width={20} />}
            sx={{ justifyContent: 'flex-start', py: 1.5, borderRadius: 1.5 }}
          >
            تغییر رمز عبور
          </Button>
        </Card>
      </Stack>

      {/* Edit dialog — admin only */}
      {isAdmin && (
        <ProfileFormDialog
          open={editOpen}
          onClose={() => setEditOpen(false)}
          profile={rawProfile}
          mode="profile"
        />
      )}

      {/* Change password dialog — anyone */}
      <ChangePasswordDialog open={pwOpen} onClose={() => setPwOpen(false)} />
    </>
  );
}

