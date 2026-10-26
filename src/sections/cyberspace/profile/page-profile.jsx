'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { fNum, toFaDigits } from 'src/utils/format-number-fa';

import { Iconify } from 'src/components/iconify';

import { ProfileFormDialog } from 'src/sections/admin/profiles/profile-form-dialog';

import { useAuthContext } from 'src/auth/hooks';

import { WidgetCard } from '../shared/widget-card';
import { PageHeader } from '../shared/page-header';
import { GridItem, WidgetGrid } from '../shared/widget-grid';
import { ChangePasswordDialog } from './change-password-dialog';

// ----------------------------------------------------------------------

// Brand colors; `null` means "use the text color" (X's black logo is invisible in dark mode)
const PLATFORM_ICONS = {
  telegram:  { icon: 'ic:baseline-telegram',                   color: '#0088cc', label: 'تلگرام' },
  twitter:   { icon: 'ri:twitter-x-fill',                      color: null,      label: 'ایکس' },
  x:         { icon: 'ri:twitter-x-fill',                      color: null,      label: 'ایکس' },
  instagram: { icon: 'mdi:instagram',                          color: '#E4405F', label: 'اینستاگرام' },
  news:      { icon: 'solar:document-text-bold',               color: '#4CAF50', label: 'خبرگزاری' },
  newspaper: { icon: 'solar:global-bold-duotone',              color: '#78909C', label: 'روزنامه' },
  bale:      { icon: 'solar:chat-round-bold',                  color: '#00A86B', label: 'بله' },
  rubika:    { icon: 'solar:chat-square-bold',                 color: '#7C3AED', label: 'روبیکا' },
  eitaa:     { icon: 'solar:chat-line-bold',                   color: '#F57C00', label: 'ایتا' },
  aparat:    { icon: 'solar:videocamera-record-bold-duotone',  color: '#FF5722', label: 'آپارات' },
  web:       { icon: 'solar:global-bold-duotone',              color: null,      label: 'وب' },
};

const TIER_LABELS = {
  heavy: { label: 'سنگین', color: 'error' },
  light: { label: 'سبک', color: 'success' },
  medium: { label: 'متوسط', color: 'warning' },
};

// ----------------------------------------------------------------------

export function PageProfile({ profileData, rawProfile, loading }) {
  const { user } = useAuthContext();
  // Profile edits go through /admin/profiles, which the backend allows for super_admin only
  const isAdmin = ['admin', 'super_admin'].includes(user?.role);
  const [editOpen, setEditOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);

  const channels = profileData?.officialChannels || [];
  const keywords = profileData?.keywords || [];
  const tier = TIER_LABELS[profileData?.tier] || (profileData?.tier ? TIER_LABELS.medium : null);

  return (
    <>
      <PageHeader
        title="پروفایل"
        description="مشخصات شخصیت تحت رصد، کلیدواژه‌ها، کانال‌های رسمی و تنظیمات حساب کاربری شما."
        actions={
          isAdmin && (
            <Button
              variant="contained"
              onClick={() => setEditOpen(true)}
              disabled={!rawProfile}
              startIcon={<Iconify icon="solar:pen-bold" width={18} />}
            >
              ویرایش پروفایل
            </Button>
          )
        }
      />

      <WidgetGrid sx={{ pb: { xs: 10, lg: 4 } }}>
        <GridItem span={{ md: 5, lg: 4 }}>
          <IdentityCard profileData={profileData} keywords={keywords} loading={loading} />
        </GridItem>

        <GridItem span={{ md: 7, lg: 8 }}>
          <WidgetCard
            title="کانال‌ها و صفحات رسمی"
            icon="solar:share-circle-bold-duotone"
            color="info"
            subheader={channels.length ? `${fNum(channels.length)} کانال ثبت‌شده` : undefined}
            loading={loading}
            empty={!channels.length}
            emptyIcon="solar:share-circle-bold-duotone"
            emptyText="کانال رسمی برای این پروفایل ثبت نشده است."
          >
            <Box
              sx={{
                display: 'grid',
                gap: 1.5,
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
              }}
            >
              {channels.map((ch, i) => (
                <ChannelItem key={`${ch.platform || ch.sourceType}-${ch.handle || i}`} channel={ch} />
              ))}
            </Box>
          </WidgetCard>
        </GridItem>

        <GridItem span={{ md: 6 }}>
          <WidgetCard
            title="اطلاعات سیستمی"
            icon="solar:server-bold-duotone"
            color="secondary"
            loading={loading}
            loadingHeight={80}
            empty={!tier && !profileData?.lastUpdate}
            emptyText="اطلاعاتی ثبت نشده است."
          >
            <Stack spacing={1.5} divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />}>
              {tier && (
                <InfoRow label="سطح پروفایل">
                  <Chip label={tier.label} size="small" color={tier.color} variant="soft" sx={{ fontWeight: 700 }} />
                </InfoRow>
              )}
              {profileData?.lastUpdate && (
                <InfoRow label="آخرین به‌روزرسانی">
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {toFaDigits(profileData.lastUpdate)}
                  </Typography>
                </InfoRow>
              )}
            </Stack>
          </WidgetCard>
        </GridItem>

        <GridItem span={{ md: 6 }}>
          <WidgetCard title="تنظیمات حساب کاربری" icon="solar:shield-user-bold-duotone" color="primary">
            <Stack spacing={2}>
              {user?.email && (
                <InfoRow label="حساب">
                  <Typography variant="body2" sx={{ fontWeight: 600, direction: 'ltr' }} noWrap>
                    {user.email}
                  </Typography>
                </InfoRow>
              )}
              <Button
                fullWidth
                variant="outlined"
                color="inherit"
                onClick={() => setPwOpen(true)}
                startIcon={<Iconify icon="solar:lock-password-bold-duotone" width={20} />}
                sx={{ justifyContent: 'flex-start', py: 1.25 }}
              >
                تغییر رمز عبور
              </Button>
            </Stack>
          </WidgetCard>
        </GridItem>
      </WidgetGrid>

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

// ----------------------------------------------------------------------

function InfoRow({ label, children }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
      <Typography variant="body2" sx={{ color: 'text.secondary', flexShrink: 0 }}>
        {label}
      </Typography>
      <Box sx={{ minWidth: 0 }}>{children}</Box>
    </Stack>
  );
}

function IdentityCard({ profileData, keywords, loading }) {
  const theme = useTheme();
  const accent = profileData?.primaryColor || theme.palette.primary.main;

  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 2,
        overflow: 'hidden',
        border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
        boxShadow: theme.vars?.customShadows?.card ?? theme.shadows[1],
      }}
    >
      <Box
        sx={{
          height: 96,
          background: `linear-gradient(135deg, ${accent} 0%, ${alpha(accent, 0.6)} 100%)`,
        }}
      />

      <Stack alignItems="center" sx={{ px: 2.5, pb: 3, mt: -6, textAlign: 'center' }}>
        {loading ? (
          <>
            <Skeleton variant="circular" width={96} height={96} />
            <Skeleton variant="text" width="60%" sx={{ mt: 2, fontSize: 24 }} />
            <Skeleton variant="text" width="40%" />
          </>
        ) : (
          <>
            <Avatar
              src={profileData?.avatar || undefined}
              alt={profileData?.name || ''}
              sx={{
                width: 96,
                height: 96,
                border: `4px solid ${theme.vars?.palette.background.paper ?? theme.palette.background.paper}`,
                boxShadow: theme.shadows[4],
                fontSize: 36,
                fontWeight: 700,
                bgcolor: 'background.paper',
                color: accent,
              }}
            >
              {profileData?.name?.charAt(0) || 'م'}
            </Avatar>

            <Typography variant="h5" sx={{ fontWeight: 800, mt: 2 }}>
              {profileData?.name || '—'}
            </Typography>
            {profileData?.role && (
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                {profileData.role}
              </Typography>
            )}
            {profileData?.organization && (
              <Typography variant="body2" sx={{ color: 'text.disabled', mt: 0.25 }}>
                {profileData.organization}
              </Typography>
            )}

            {keywords.length > 0 && (
              <Box sx={{ width: 1, mt: 2.5, pt: 2.5, borderTop: `1px dashed ${alpha(theme.palette.grey[500], 0.24)}` }}>
                <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontWeight: 700, mb: 1.25, fontSize: 12 }}>
                  کلیدواژه‌های رصد ({fNum(keywords.length)})
                </Typography>
                <Stack direction="row" flexWrap="wrap" justifyContent="center" gap={0.75}>
                  {keywords.map((kw) => (
                    <Chip
                      key={kw}
                      label={kw}
                      size="small"
                      sx={{
                        height: 26,
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'text.primary',
                        bgcolor: alpha(accent, 0.1),
                        border: `1px solid ${alpha(accent, 0.24)}`,
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            )}
          </>
        )}
      </Stack>
    </Card>
  );
}

function ChannelItem({ channel: ch }) {
  const theme = useTheme();
  const platform = PLATFORM_ICONS[ch.platform] ||
    PLATFORM_ICONS[ch.sourceType] || {
      icon: 'solar:link-bold',
      color: null,
      label: ch.platform || ch.sourceType || '?',
    };
  // Brand color when it has one, otherwise the theme's text color (works in dark mode)
  const iconColor = platform.color || theme.vars?.palette.text.primary || theme.palette.text.primary;
  const tileBg = alpha(platform.color || theme.palette.grey[500], platform.color ? 0.1 : 0.12);

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1.5}
      sx={{
        p: 1.5,
        borderRadius: 1.5,
        border: `1px solid ${alpha(theme.palette.grey[500], 0.16)}`,
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 1.25,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: tileBg,
          flexShrink: 0,
        }}
      >
        <Iconify icon={platform.icon} width={22} sx={{ color: iconColor }} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
          {ch.name || ch.handle || platform.label}
        </Typography>
        {ch.handle && (
          <Typography
            variant="caption"
            component="div"
            sx={{ color: 'text.secondary', fontSize: 12, direction: 'ltr', textAlign: 'end' }}
            noWrap
          >
            @{ch.handle.replace(/^@/, '')}
          </Typography>
        )}
      </Box>
      <Chip
        label={platform.label}
        size="small"
        sx={{ height: 24, fontSize: 12, flexShrink: 0, color: 'text.secondary', bgcolor: alpha(theme.palette.grey[500], 0.1) }}
      />
    </Stack>
  );
}
