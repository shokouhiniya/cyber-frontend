'use client';

import { useMemo } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { fNum, fShort, fDateFa, fRelativeFa } from 'src/utils/format-number-fa';

import { useProfile } from 'src/api/dashboard';

import { Iconify } from 'src/components/iconify';
import { WIDGET_TOOLTIPS } from 'src/components/info-tooltip/widget-tooltips';

import { PlatformIcon } from './platform-icon';
import { WidgetCard } from '../shared/widget-card';
import { platformById, getPlatformUrl, normalizeHandle } from './platform-config';

// ----------------------------------------------------------------------

const FALLBACK_PLATFORM = {
  label: 'سایر',
  iconType: 'iconify',
  icon: 'solar:global-bold-duotone',
  color: '#607D8B',
  sourceType: null,
  ingested: false,
};

// The `active` flag is an admin setting that decides whether the backend
// collects the page's posts — it says nothing about whether the page itself
// is active. Label it as monitoring status, and be honest about platforms
// whose posts are not collected at all.
function getMonitorStatus(channel, cfg) {
  if (channel.active === false) {
    return { label: 'خارج از پایش', color: 'default', hint: 'مدیر سامانه پایش این صفحه را متوقف کرده است.' };
  }
  if (!cfg.ingested) {
    return {
      label: 'بدون جمع‌آوری پست',
      color: 'default',
      hint: 'پست‌های این بستر فعلاً جمع‌آوری نمی‌شوند؛ صفحه فقط برای معرفی فهرست شده است.',
    };
  }
  return { label: 'در حال پایش', color: 'success', hint: 'پست‌های این صفحه در هر نوبت جمع‌آوری خوانده می‌شوند.' };
}

/** Latest publishedAt per channel, from the loaded official posts. */
function useLastPostByChannel(channels, posts) {
  return useMemo(() => {
    const latest = new Map(); // `${sourceType}:${handle}` → timestamp
    const latestBySource = new Map(); // sourceType → timestamp
    for (const post of posts) {
      if (!post.publishedAt) continue;
      const t = new Date(post.publishedAt).getTime();
      if (Number.isNaN(t)) continue;
      const key = `${post.sourceType}:${normalizeHandle(post.screenName)}`;
      if (!latest.has(key) || latest.get(key) < t) latest.set(key, t);
      if (!latestBySource.has(post.sourceType) || latestBySource.get(post.sourceType) < t) {
        latestBySource.set(post.sourceType, t);
      }
    }

    const perPlatformCount = channels.reduce((acc, ch) => {
      acc[ch.platform] = (acc[ch.platform] || 0) + 1;
      return acc;
    }, {});

    return channels.map((ch) => {
      const sourceType = platformById[ch.platform]?.sourceType;
      if (!sourceType) return null;
      const exact = latest.get(`${sourceType}:${normalizeHandle(ch.handle)}`);
      if (exact) return exact;
      // Handle spelled differently from the post's screen name: fall back to the
      // platform's latest post only when this is the platform's only channel.
      return perPlatformCount[ch.platform] === 1 ? latestBySource.get(sourceType) ?? null : null;
    });
  }, [channels, posts]);
}

// ----------------------------------------------------------------------

export function OfficialAccounts({ posts = [], loading: postsLoading }) {
  const theme = useTheme();

  const { data: profile, isLoading } = useProfile();
  const channels = useMemo(() => profile?.officialChannels ?? [], [profile]);
  const lastPosts = useLastPostByChannel(channels, posts);

  const monitoredCount = channels.filter(
    (c) => c.active !== false && (platformById[c.platform] ?? FALLBACK_PLATFORM).ingested
  ).length;
  const totalFollowers = channels.reduce((s, c) => s + (c.followers || 0), 0);
  const totalPosts = channels.reduce((s, c) => s + (c.posts || 0), 0);

  const subheader = [
    `${fNum(channels.length)} صفحه`,
    `${fNum(monitoredCount)} در حال پایش`,
    totalFollowers > 0 && `${fShort(totalFollowers)} دنبال‌کننده`,
    totalPosts > 0 && `${fShort(totalPosts)} انتشار`,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <WidgetCard
      title="صفحات رسمی"
      icon="solar:shield-check-bold-duotone"
      color="info"
      tooltip={WIDGET_TOOLTIPS.officialAccounts}
      subheader={channels.length ? subheader : undefined}
      loading={isLoading}
      empty={!channels.length}
      emptyIcon="solar:shield-check-bold-duotone"
      emptyText="هنوز صفحه رسمی تعریف نشده است. از پنل مدیریت ← پروفایل‌ها ← ویرایش، صفحات رسمی را اضافه کنید."
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 1.5,
        }}
      >
        {channels.map((ch, idx) => {
          const cfg = platformById[ch.platform] ?? { ...FALLBACK_PLATFORM, label: ch.platform || FALLBACK_PLATFORM.label };
          // X's brand color is black — use the text color so it stays visible in dark mode
          const tone = cfg.color === '#000000' ? theme.palette.text.primary : cfg.color;
          const status = getMonitorStatus(ch, cfg);
          const isMonitored = status.color === 'success';
          const statusTone = isMonitored ? theme.palette.success.main : theme.palette.text.secondary;
          const href = getPlatformUrl(ch);
          const lastPost = lastPosts[idx];

          return (
            <Box
              key={`${ch.platform}-${ch.handle}-${idx}`}
              component={href ? Link : 'div'}
              href={href || undefined}
              target={href ? '_blank' : undefined}
              rel={href ? 'noopener noreferrer' : undefined}
              underline="none"
              color="inherit"
              sx={{
                p: 2,
                display: 'block',
                borderRadius: 1.5,
                bgcolor: alpha(tone, 0.05),
                border: `1px solid ${alpha(tone, 0.16)}`,
                transition: theme.transitions.create(['background-color', 'border-color']),
                ...(href && {
                  '&:hover': { bgcolor: alpha(tone, 0.1), borderColor: alpha(tone, 0.32) },
                }),
              }}
            >
              <Stack spacing={1.5}>
                {/* Platform + handle */}
                <Stack direction="row" alignItems="center" spacing={1.25}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 1.25,
                      bgcolor: alpha(tone, 0.14),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <PlatformIcon cfg={cfg} size={20} />
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700 }}>
                        {cfg.label}
                      </Typography>
                      {ch.verified && (
                        <Tooltip title="تأییدشده" arrow>
                          <Iconify icon="solar:verified-check-bold" width={16} sx={{ color: 'info.main', flexShrink: 0 }} />
                        </Tooltip>
                      )}
                    </Stack>
                    <Typography
                      variant="caption"
                      noWrap
                      component="div"
                      sx={{ color: 'text.secondary', direction: 'ltr', textAlign: 'right' }}
                    >
                      {ch.handle}
                    </Typography>
                  </Box>
                </Stack>

                {/* Monitoring status */}
                <Tooltip title={status.hint} arrow placement="top">
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={0.75}
                    sx={{
                      alignSelf: 'flex-start',
                      px: 1,
                      py: 0.25,
                      borderRadius: 1,
                      bgcolor: alpha(statusTone, 0.12),
                      color: isMonitored ? 'success.main' : 'text.secondary',
                    }}
                  >
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'currentColor' }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'inherit' }}>
                      {status.label}
                    </Typography>
                  </Stack>
                </Tooltip>

                {/* Stats */}
                {(ch.followers != null || ch.posts != null) && (
                  <Stack direction="row" spacing={3}>
                    {ch.followers != null && (
                      <Box>
                        <Typography variant="caption" component="div" sx={{ color: 'text.secondary' }}>
                          دنبال‌کننده
                        </Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.3 }}>
                          {fShort(ch.followers)}
                        </Typography>
                      </Box>
                    )}
                    {ch.posts != null && (
                      <Box>
                        <Typography variant="caption" component="div" sx={{ color: 'text.secondary' }}>
                          انتشار
                        </Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.3 }}>
                          {fShort(ch.posts)}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                )}

                {/* Last collected post — only for platforms whose posts are collected */}
                {cfg.ingested && ch.active !== false && !postsLoading && (
                  <Stack direction="row" alignItems="center" spacing={0.75} sx={{ color: 'text.secondary' }}>
                    <Iconify icon="solar:clock-circle-linear" width={14} sx={{ flexShrink: 0 }} />
                    <Typography variant="caption" sx={{ color: 'inherit' }}>
                      {lastPost ? (
                        <>
                          آخرین پست: {fRelativeFa(lastPost)}
                          {/* fRelativeFa already falls back to the date after 30 days */}
                          {Date.now() - lastPost < 30 * 86_400_000 && (
                            <Box component="span" sx={{ color: 'text.disabled' }}>
                              {' '}
                              ({fDateFa(lastPost)})
                            </Box>
                          )}
                        </>
                      ) : (
                        'پستی از این صفحه در انتشارهای اخیر یافت نشد'
                      )}
                    </Typography>
                  </Stack>
                )}
              </Stack>
            </Box>
          );
        })}
      </Box>
    </WidgetCard>
  );
}
