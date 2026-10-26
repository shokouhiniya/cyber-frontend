'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Skeleton from '@mui/material/Skeleton';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { fNum } from 'src/utils/format-number-fa';

import { Iconify } from 'src/components/iconify';

import { getPlatform, PlatformIcon } from './platforms';
import { PostCard, usePostDrawer } from '../shared/post-card';
import { WidgetCard, WidgetToggle } from '../shared/widget-card';

// ----------------------------------------------------------------------

export const POST_TIME_FILTERS = [
  { value: '24h', label: '۲۴ ساعت' },
  { value: '7d', label: '۷ روز' },
  { value: '30d', label: '۳۰ روز' },
  { value: 'all', label: 'همه' },
];

const PAGE_SIZE = 8;

/**
 * Shared shell for the three post lists on the posts page (most viewed,
 * most discussed, most shared): WidgetCard + time toggle + active platform
 * filter + "show more". The data hook is passed in so each list keeps its own
 * query.
 *
 * Open by default from md up; collapsed on phones until the header button is
 * tapped. The list is unmounted while collapsed so no media is requested.
 */
export function PostListWidget({
  title,
  icon,
  color,
  tooltip,
  subheader,
  useData,
  platform = null,
  onClearPlatform,
  getPostProps,
  emptyText = 'در این بازه پستی یافت نشد.',
}) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { openPost, PostDrawer } = usePostDrawer();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [timeFilter, setTimeFilter] = useState('24h');

  const open = isDesktop || mobileOpen;

  const { data: posts = [], isLoading } = useData(timeFilter, platform);

  const displayedPosts = expanded ? posts : posts.slice(0, PAGE_SIZE);
  const platformMeta = platform ? getPlatform(platform) : null;

  const handleTimeFilter = (value) => {
    setTimeFilter(value);
    setExpanded(false);
  };

  const filterRow = (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ mb: 2, gap: 1, flexWrap: 'wrap' }}
    >
      <WidgetToggle value={timeFilter} onChange={handleTimeFilter} options={POST_TIME_FILTERS} />
      {platformMeta && (
        <Chip
          size="small"
          variant="soft"
          color="primary"
          icon={<PlatformIcon platform={platformMeta} width={16} color="inherit" />}
          label={`فقط ${platformMeta.label}`}
          onDelete={onClearPlatform}
          deleteIcon={<Iconify icon="solar:close-circle-bold" width={18} />}
          sx={{ fontWeight: 700, fontSize: 12 }}
        />
      )}
    </Stack>
  );

  return (
    <>
      <WidgetCard
        title={title}
        icon={icon}
        color={color}
        tooltip={tooltip}
        subheader={
          platformMeta ? `${subheader} · ${platformMeta.label}` : subheader
        }
        action={
          !isDesktop && (
            <IconButton
              size="small"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'بستن فهرست' : 'نمایش فهرست'}
            >
              <Iconify icon={mobileOpen ? 'solar:alt-arrow-up-linear' : 'solar:alt-arrow-down-linear'} width={20} />
            </IconButton>
          )
        }
        contentSx={open ? undefined : { p: 0, pb: 2.5 }}
      >
        <Collapse in={open} timeout={300} unmountOnExit>
          {filterRow}

          {isLoading ? (
            <Stack spacing={1.5}>
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} variant="rounded" height={132} />
              ))}
            </Stack>
          ) : posts.length === 0 ? (
            <Stack alignItems="center" spacing={1} sx={{ py: 4, color: 'text.disabled' }}>
              <Iconify icon="solar:inbox-line-bold-duotone" width={40} />
              <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                {platformMeta ? `برای ${platformMeta.label} در این بازه پستی یافت نشد.` : emptyText}
              </Typography>
              {platformMeta && onClearPlatform && (
                <Button size="small" onClick={onClearPlatform}>
                  نمایش همه پلتفرم‌ها
                </Button>
              )}
            </Stack>
          ) : (
            <>
              <Stack spacing={1.5}>
                {displayedPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onClick={() => openPost(post)}
                    {...getPostProps?.(post)}
                  />
                ))}
              </Stack>
              {!expanded && posts.length > PAGE_SIZE && (
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    color="inherit"
                    size="small"
                    fullWidth
                    onClick={() => setExpanded(true)}
                    startIcon={<Iconify icon="solar:alt-arrow-down-linear" width={16} />}
                    sx={{ fontSize: 13, fontWeight: 600, borderRadius: 1.5 }}
                  >
                    {fNum(posts.length - PAGE_SIZE)} پست دیگر
                  </Button>
                </Box>
              )}
            </>
          )}
        </Collapse>
      </WidgetCard>
      {PostDrawer}
    </>
  );
}

// ----------------------------------------------------------------------

/** Small coloured metric pill for the PostCard badge slot (e.g. «۱۲ هزار بازدید»). */
export function MetricBadge({ icon, label, color = 'primary' }) {
  const theme = useTheme();
  const tone = theme.palette[color]?.main ?? color;
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={0.5}
      sx={{
        px: 1,
        py: 0.375,
        borderRadius: 1,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        bgcolor: alpha(tone, 0.12),
        color: theme.palette[color]?.dark ?? tone,
        ...theme.applyStyles('dark', { color: theme.palette[color]?.light ?? tone }),
      }}
    >
      <Iconify icon={icon} width={14} />
      <Typography component="span" sx={{ fontSize: 12, fontWeight: 700, lineHeight: 1.4 }}>
        {label}
      </Typography>
    </Stack>
  );
}
