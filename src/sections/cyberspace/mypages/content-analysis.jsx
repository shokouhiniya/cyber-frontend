import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { fNum, fShort, fDateFa, fPercent, fRelativeFa } from 'src/utils/format-number-fa';

import { Iconify } from 'src/components/iconify';
import { SvgColor } from 'src/components/svg-color';
import { Chart, useChart } from 'src/components/chart';
import { WIDGET_TOOLTIPS } from 'src/components/info-tooltip/widget-tooltips';

import { WidgetCard, WidgetToggle } from '../shared/widget-card';

// ----------------------------------------------------------------------

const SOURCE_META = {
  telegram: { label: 'تلگرام', icon: 'ic:baseline-telegram', color: '#0088cc' },
  twitter: { label: 'ایکس', icon: 'ri:twitter-x-fill', color: '#000000' },
  instagram: { label: 'اینستاگرام', icon: 'mdi:instagram', color: '#E4405F' },
  bale: { label: 'بله', svg: '/assets/icons/social/bale-mono.svg', color: '#00A86B' },
  rubika: { label: 'روبیکا', svg: '/assets/icons/social/rubika-mono.svg', color: '#7C3AED' },
  eitaa: { label: 'ایتا', svg: '/assets/icons/social/eitaa-mono.svg', color: '#F57C00' },
};

const METRIC_OPTIONS = [
  { value: 'count', label: 'پست' },
  { value: 'views', label: 'بازدید' },
];

const MAX_WEEKS = 12;
const WEEK_MS = 7 * 86_400_000;
const SHORT_DATE = { day: 'numeric', month: 'short' };

const engagementScore = (p) => (p.viewCount || 0) + (p.likeCount || 0) * 3 + (p.retweetCount || 0) * 2;

/**
 * Rolling 7-day buckets ending now, oldest first. Every week in the window
 * gets a bucket (zero when nothing was published), so the axis is continuous.
 */
function buildWeeklyBuckets(posts, weeks) {
  const now = Date.now();
  const buckets = Array.from({ length: weeks }, (_, i) => {
    const start = now - (weeks - i) * WEEK_MS;
    const end = start + WEEK_MS - 1;
    return {
      label: fDateFa(start, SHORT_DATE),
      range: `${fDateFa(start, SHORT_DATE)} تا ${fDateFa(end, SHORT_DATE)}`,
      count: 0,
      views: 0,
    };
  });

  for (const post of posts) {
    if (!post.publishedAt) continue;
    const t = new Date(post.publishedAt).getTime();
    if (Number.isNaN(t)) continue;
    const weekIdx = Math.floor((now - t) / WEEK_MS);
    const bucketIdx = weeks - 1 - weekIdx;
    if (bucketIdx >= 0 && bucketIdx < weeks) {
      buckets[bucketIdx].count += 1;
      buckets[bucketIdx].views += post.viewCount || 0;
    }
  }
  return buckets;
}

// ----------------------------------------------------------------------

function SourceIcon({ source, size = 16 }) {
  const theme = useTheme();
  const meta = SOURCE_META[source] || { icon: 'solar:global-bold', color: theme.palette.grey[500] };
  // X's brand color is black — use the text color so it stays visible in dark mode
  const color = meta.color === '#000000' ? theme.palette.text.primary : meta.color;
  if (meta.svg) return <SvgColor src={meta.svg} sx={{ width: size, height: size, color, flexShrink: 0 }} />;
  return <Iconify icon={meta.icon} width={size} sx={{ color, flexShrink: 0 }} />;
}

function SectionLabel({ children, sx }) {
  return (
    <Typography variant="subtitle2" sx={[{ fontWeight: 700, mb: 1.25 }, ...(Array.isArray(sx) ? sx : [sx])]}>
      {children}
    </Typography>
  );
}

// ----------------------------------------------------------------------

export function ContentAnalysis({ loading, posts = [], total = 0 }) {
  const theme = useTheme();
  const [metric, setMetric] = useState('count'); // 'count' | 'views'

  const officialPosts = useMemo(
    () => posts.filter((p) => p.selectionReason?.startsWith('official_page_')),
    [posts]
  );
  const sampleSize = officialPosts.length;

  // Per-source aggregates
  const bySource = useMemo(() => {
    const map = {};
    for (const p of officialPosts) {
      const src = p.sourceType || 'unknown';
      if (!map[src]) map[src] = { source: src, count: 0 };
      map[src].count += 1;
    }
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [officialPosts]);

  // How far back the loaded sample reaches. When the API has more posts than
  // were loaded, weeks older than the oldest loaded post have no data (not
  // zero posts), so the chart only goes back as far as the sample does.
  const oldestTs = useMemo(() => {
    const times = officialPosts
      .map((p) => new Date(p.publishedAt).getTime())
      .filter((t) => !Number.isNaN(t));
    return times.length ? Math.min(...times) : null;
  }, [officialPosts]);
  const isTruncated = total > sampleSize;
  const weekCount =
    isTruncated && oldestTs
      ? Math.min(MAX_WEEKS, Math.max(1, Math.ceil((Date.now() - oldestTs) / WEEK_MS)))
      : MAX_WEEKS;

  const weeks = useMemo(() => buildWeeklyBuckets(officialPosts, weekCount), [officialPosts, weekCount]);

  // Summary stats
  const totalViews = officialPosts.reduce((s, p) => s + (p.viewCount || 0), 0);
  const totalLikes = officialPosts.reduce((s, p) => s + (p.likeCount || 0), 0);
  const totalFwd = officialPosts.reduce((s, p) => s + (p.retweetCount || 0), 0);
  const avgViews = sampleSize ? totalViews / sampleSize : 0;

  // Top post by engagement
  const topPost = useMemo(
    () => [...officialPosts].sort((a, b) => engagementScore(b) - engagementScore(a))[0] || null,
    [officialPosts]
  );

  const isViews = metric === 'views';
  const chartColor = isViews ? theme.palette.info.main : theme.palette.primary.main;

  const chartOptions = useChart({
    colors: [chartColor],
    xaxis: {
      categories: weeks.map((w) => w.label),
      labels: { rotate: 0, hideOverlappingLabels: true, trim: false },
      tickAmount: Math.min(weeks.length, 6),
    },
    yaxis: {
      min: 0,
      forceNiceScale: true,
      labels: { formatter: (v) => (isViews ? fShort(v) : fNum(v)) },
    },
    plotOptions: { bar: { columnWidth: weeks.length > 6 ? '60%' : '40%', borderRadius: 3 } },
    legend: { show: false },
    tooltip: {
      x: { formatter: (_v, { dataPointIndex }) => `هفته ${weeks[dataPointIndex]?.range ?? ''}` },
      y: {
        formatter: (v) => (isViews ? `${fShort(v)} بازدید` : `${fNum(v)} پست`),
        title: { formatter: () => '' },
      },
    },
  });

  const series = [{ name: METRIC_OPTIONS.find((m) => m.value === metric).label, data: weeks.map((w) => w[metric]) }];

  const subheader = isTruncated
    ? `بر اساس ${fNum(sampleSize)} پست اخیر صفحات رسمی (از ${fNum(total)} پست ثبت‌شده)`
    : `بر اساس ${fNum(sampleSize)} پست صفحات رسمی`;

  const stats = [
    { icon: 'solar:eye-bold', label: 'بازدید', value: fShort(totalViews), color: theme.palette.info.main },
    { icon: 'solar:like-bold', label: 'لایک', value: fShort(totalLikes), color: theme.palette.success.main },
    { icon: 'solar:share-bold', label: 'بازنشر', value: fShort(totalFwd), color: theme.palette.warning.main },
    { icon: 'solar:chart-2-bold', label: 'میانگین بازدید هر پست', value: fShort(Math.round(avgViews)), color: theme.palette.primary.main },
  ];

  return (
    <WidgetCard
      title="تحلیل محتوای منتشرشده"
      icon="solar:chart-square-bold-duotone"
      color="warning"
      tooltip={WIDGET_TOOLTIPS.contentAnalysis}
      subheader={sampleSize ? subheader : 'الگوهای انتشار صفحات رسمی'}
      loading={loading}
      loadingHeight={260}
      empty={!sampleSize}
      emptyText="هنوز پستی از صفحات رسمی جمع‌آوری نشده است. پس از اتصال صفحات رسمی، آمار انتشار اینجا نمایش داده می‌شود."
    >
      {/* Summary stats — the post count lives in the subheader, so it is not repeated here */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(4, minmax(0, 1fr))' },
          gap: 1,
          mb: 3,
        }}
      >
        {stats.map(({ icon, label, value, color }) => (
          <Box
            key={label}
            sx={{
              p: 1.5,
              borderRadius: 1.5,
              bgcolor: alpha(color, 0.08),
              border: `1px solid ${alpha(color, 0.16)}`,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.5, color }}>
              <Iconify icon={icon} width={16} sx={{ flexShrink: 0 }} />
              <Typography variant="caption" noWrap sx={{ color: 'text.secondary' }}>
                {label}
              </Typography>
            </Stack>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.3 }}>
              {value}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Weekly activity chart */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1} sx={{ mb: 1 }}>
          <Box>
            <SectionLabel sx={{ mb: 0 }}>فعالیت هفتگی · {fNum(weekCount)} هفته اخیر</SectionLabel>
            {isTruncated && weekCount < MAX_WEEKS && (
              <Typography variant="caption" component="div" sx={{ color: 'text.secondary' }}>
                این نمونه فقط تا {fDateFa(oldestTs)} را پوشش می‌دهد.
              </Typography>
            )}
          </Box>
          <WidgetToggle value={metric} onChange={setMetric} options={METRIC_OPTIONS} />
        </Stack>
        <Chart type="bar" series={series} options={chartOptions} height={220} />
      </Box>

      {/* Per-source breakdown */}
      {bySource.length > 1 && (
        <Box sx={{ mb: 3 }}>
          <SectionLabel>توزیع بسترها</SectionLabel>
          <Stack spacing={1}>
            {bySource.map((src) => {
              const meta = SOURCE_META[src.source] || { label: src.source, color: theme.palette.grey[500] };
              const barColor = meta.color === '#000000' ? theme.palette.text.primary : meta.color;
              const pct = (src.count / sampleSize) * 100;
              return (
                <Stack key={src.source} direction="row" alignItems="center" spacing={1.25}>
                  <SourceIcon source={src.source} size={16} />
                  <Typography variant="body2" noWrap sx={{ width: 72, flexShrink: 0, color: 'text.secondary' }}>
                    {meta.label}
                  </Typography>
                  <Box
                    sx={{
                      flex: 1,
                      height: 8,
                      borderRadius: 4,
                      bgcolor: alpha(theme.palette.grey[500], 0.12),
                      overflow: 'hidden',
                    }}
                  >
                    <Box sx={{ width: `${pct}%`, height: 1, borderRadius: 4, bgcolor: barColor }} />
                  </Box>
                  <Typography variant="body2" sx={{ width: 76, flexShrink: 0, textAlign: 'end', fontWeight: 600 }}>
                    {fNum(src.count)}{' '}
                    <Typography component="span" variant="caption" sx={{ color: 'text.secondary' }}>
                      ({fPercent(pct)})
                    </Typography>
                  </Typography>
                </Stack>
              );
            })}
          </Stack>
        </Box>
      )}

      {/* Top post */}
      {topPost && (
        <Box>
          <SectionLabel>پربازدیدترین پست</SectionLabel>
          <Box
            sx={{
              p: 2,
              borderRadius: 1.5,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
            }}
          >
            <Stack direction="row" alignItems="center" flexWrap="wrap" columnGap={1.5} rowGap={0.5} sx={{ mb: 1 }}>
              <Stack direction="row" alignItems="center" spacing={0.75} sx={{ minWidth: 0 }}>
                <SourceIcon source={topPost.sourceType} size={16} />
                {topPost.screenName && (
                  <Typography variant="caption" noWrap sx={{ fontWeight: 600, color: 'text.secondary', direction: 'ltr' }}>
                    @{topPost.screenName}
                  </Typography>
                )}
              </Stack>
              {topPost.publishedAt && (
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {fRelativeFa(topPost.publishedAt)}
                </Typography>
              )}
              <Box sx={{ flex: 1 }} />
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ color: 'text.secondary' }}>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Iconify icon="solar:eye-bold" width={14} />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'inherit' }}>
                    {fShort(topPost.viewCount || 0)}
                  </Typography>
                </Stack>
                {topPost.likeCount > 0 && (
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Iconify icon="solar:like-bold" width={14} />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'inherit' }}>
                      {fShort(topPost.likeCount)}
                    </Typography>
                  </Stack>
                )}
              </Stack>
            </Stack>
            <Typography
              variant="body2"
              sx={{
                color: 'text.primary',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.8,
                wordBreak: 'break-word',
              }}
            >
              {topPost.text}
            </Typography>
            {topPost.postUrl && (
              <Link
                href={topPost.postUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="caption"
                underline="hover"
                sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mt: 1, fontWeight: 600 }}
              >
                مشاهده پست
                <Iconify icon="solar:arrow-left-linear" width={14} />
              </Link>
            )}
          </Box>
        </Box>
      )}
    </WidgetCard>
  );
}
