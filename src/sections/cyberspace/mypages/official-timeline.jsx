import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { fNum, fDateFa, fRelativeFa } from 'src/utils/format-number-fa';

import { Iconify } from 'src/components/iconify';
import { WIDGET_TOOLTIPS } from 'src/components/info-tooltip/widget-tooltips';

import { WidgetCard } from '../shared/widget-card';
import { PostCard, usePostDrawer } from '../shared/post-card';

// ----------------------------------------------------------------------

const PAGE_SIZE = 12;
const DAY_MS = 86_400_000;
// The newest official post is flagged as stale after this many days
const STALE_AFTER_DAYS = 3;

/** Calendar day in Tehran as YYYY-MM-DD (sortable, comparable). */
function tehranDayKey(date) {
  return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Tehran' });
}

function dayDistanceLabel(dayKey, todayKey) {
  const diff = Math.round((Date.parse(todayKey) - Date.parse(dayKey)) / DAY_MS);
  if (diff <= 0) return 'امروز';
  if (diff === 1) return 'دیروز';
  return `${fNum(diff)} روز پیش`;
}

/** Posts (already newest first) grouped by Tehran calendar day. */
function groupByDay(posts) {
  const groups = [];
  for (const post of posts) {
    const d = post.publishedAt ? new Date(post.publishedAt) : null;
    const key = d && !Number.isNaN(d.getTime()) ? tehranDayKey(d) : 'unknown';
    let group = groups[groups.length - 1];
    if (!group || group.key !== key) {
      group = { key, date: key === 'unknown' ? null : d, posts: [] };
      groups.push(group);
    }
    group.posts.push(post);
  }
  return groups;
}

// ----------------------------------------------------------------------

export function OfficialTimeline({ loading, posts = [], total = 0 }) {
  const theme = useTheme();
  const { openPost, PostDrawer } = usePostDrawer();
  const [showCount, setShowCount] = useState(PAGE_SIZE);

  // The API returns newest first; sort defensively so grouping by day holds
  const sorted = useMemo(
    () =>
      [...posts].sort(
        (a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime()
      ),
    [posts]
  );

  const dated = sorted.filter((p) => p.publishedAt);
  const newest = dated.length ? new Date(dated[0].publishedAt) : null;
  const oldest = dated.length ? new Date(dated[dated.length - 1].publishedAt) : null;
  const isStale = newest ? Date.now() - newest.getTime() > STALE_AFTER_DAYS * DAY_MS : false;

  const displayed = sorted.slice(0, showCount);
  const remaining = sorted.length - displayed.length;
  const groups = groupByDay(displayed);
  const todayKey = tehranDayKey(new Date());

  const subheaderParts = [];
  if (oldest && newest) subheaderParts.push(`از ${fDateFa(oldest)} تا ${fDateFa(newest)}`);
  subheaderParts.push(
    total > sorted.length
      ? `${fNum(sorted.length)} انتشار اخیر از ${fNum(total)} انتشار ثبت‌شده`
      : `${fNum(sorted.length)} انتشار`
  );

  const statusTone = isStale ? theme.palette.warning.main : theme.palette.success.main;

  return (
    <>
      <WidgetCard
        title="تایم‌لاین یکپارچه"
        icon="solar:graph-up-bold-duotone"
        tooltip={WIDGET_TOOLTIPS.officialTimeline}
        subheader={sorted.length ? subheaderParts.join(' · ') : 'آخرین انتشارهای صفحات رسمی'}
        loading={loading}
        loadingHeight={240}
        empty={!sorted.length}
        emptyIcon="solar:inbox-line-bold-duotone"
        emptyText="هنوز پستی از صفحات رسمی جمع‌آوری نشده است."
        action={
          newest && (
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.75}
              sx={{
                px: 1.25,
                py: 0.5,
                borderRadius: 1,
                bgcolor: alpha(statusTone, 0.12),
                color: isStale ? 'warning.dark' : 'success.dark',
                ...theme.applyStyles('dark', { color: isStale ? 'warning.light' : 'success.light' }),
              }}
            >
              <Iconify icon={isStale ? 'solar:danger-triangle-bold' : 'solar:clock-circle-bold'} width={16} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'inherit', whiteSpace: 'nowrap' }}>
                آخرین انتشار: {fRelativeFa(newest)}
              </Typography>
            </Stack>
          )
        }
      >
        <Stack spacing={3}>
          {groups.map((group) => (
            <Box key={group.key}>
              {/* Day header */}
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mb: 1.5, pb: 1, borderBottom: `1px dashed ${alpha(theme.palette.grey[500], 0.24)}` }}
              >
                <Iconify icon="solar:calendar-linear" width={16} sx={{ color: 'text.secondary' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {group.date
                    ? fDateFa(group.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
                    : 'بدون تاریخ'}
                </Typography>
                {group.date && (
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {dayDistanceLabel(group.key, todayKey)}
                  </Typography>
                )}
                <Box sx={{ flex: 1 }} />
                <Typography variant="caption" sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
                  {fNum(group.posts.length)} پست
                </Typography>
              </Stack>

              <Box
                sx={{
                  display: 'grid',
                  gap: 1.5,
                  gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' },
                  alignItems: 'start',
                }}
              >
                {group.posts.map((post) => (
                  <PostCard key={post.id} post={post} onClick={() => openPost(post)} />
                ))}
              </Box>
            </Box>
          ))}
        </Stack>

        {remaining > 0 && (
          <Button
            variant="outlined"
            color="inherit"
            fullWidth
            onClick={() => setShowCount((c) => c + PAGE_SIZE)}
            startIcon={<Iconify icon="solar:alt-arrow-down-linear" width={18} />}
            sx={{ mt: 2.5, fontWeight: 600, borderColor: alpha(theme.palette.grey[500], 0.32) }}
          >
            نمایش بیشتر ({fNum(remaining)} پست دیگر)
          </Button>
        )}
      </WidgetCard>
      {PostDrawer}
    </>
  );
}
