import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';
import { InfoTooltip } from 'src/components/info-tooltip';
import { WIDGET_TOOLTIPS } from 'src/components/info-tooltip/widget-tooltips';
import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const SOURCE_META = {
  telegram:  { label: 'تلگرام',    icon: 'ic:baseline-telegram',   color: '#0088cc' },
  twitter:   { label: 'ایکس',      icon: 'ri:twitter-x-fill',      color: '#000000' },
  instagram: { label: 'اینستاگرام',icon: 'mdi:instagram',           color: '#E4405F' },
  bale:      { label: 'بله',       svg: '/assets/icons/social/bale-mono.svg', color: '#00A86B' },
  rubika:    { label: 'روبیکا',    svg: '/assets/icons/social/rubika-mono.svg', color: '#7C3AED' },
  eitaa:     { label: 'ایتا',      svg: '/assets/icons/social/eitaa-mono.svg', color: '#F57C00' },
};

const formatNum = (n) => {
  if (!n) return '۰';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  return Number(n).toLocaleString('fa-IR');
};

// Build weekly buckets from posts array
function buildWeeklyBuckets(posts, weeks = 12) {
  const now = Date.now();
  const buckets = Array.from({ length: weeks }, (_, i) => ({
    label: `هفته ${(weeks - i).toLocaleString('fa-IR')}`,
    weekStart: now - (weeks - i) * 7 * 86400_000,
    count: 0,
    views: 0,
  }));

  for (const post of posts) {
    if (!post.publishedAt) continue;
    const t = new Date(post.publishedAt).getTime();
    const weekIdx = Math.floor((now - t) / (7 * 86400_000));
    const bucketIdx = weeks - 1 - weekIdx;
    if (bucketIdx >= 0 && bucketIdx < weeks) {
      buckets[bucketIdx].count++;
      buckets[bucketIdx].views += post.viewCount || 0;
    }
  }
  return buckets;
}

// ----------------------------------------------------------------------

function SourceIcon({ source, size = 16 }) {
  const meta = SOURCE_META[source] || { icon: 'solar:global-bold', color: '#868E96' };
  if (meta.svg) return <SvgColor src={meta.svg} sx={{ width: size, height: size, color: meta.color }} />;
  return <Iconify icon={meta.icon} width={size} sx={{ color: meta.color }} />;
}

// ----------------------------------------------------------------------

export function ContentAnalysis({ loading, posts = [] }) {
  const theme = useTheme();
  const [metric, setMetric] = useState('count'); // 'count' | 'views'

  const officialPosts = useMemo(
    () => posts.filter((p) => p.selectionReason?.startsWith('official_page_')),
    [posts],
  );

  // Per-source aggregates
  const bySource = useMemo(() => {
    const map = {};
    for (const p of officialPosts) {
      const src = p.sourceType || 'unknown';
      if (!map[src]) map[src] = { source: src, count: 0, views: 0, likes: 0, forwards: 0 };
      map[src].count++;
      map[src].views    += p.viewCount    || 0;
      map[src].likes    += p.likeCount    || 0;
      map[src].forwards += p.retweetCount || 0;
    }
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [officialPosts]);

  // Weekly activity
  const weeks = useMemo(() => buildWeeklyBuckets(officialPosts, 12), [officialPosts]);
  const maxVal = Math.max(...weeks.map((w) => metric === 'views' ? w.views : w.count), 1);

  // Summary stats
  const totalPosts   = officialPosts.length;
  const totalViews   = officialPosts.reduce((s, p) => s + (p.viewCount || 0), 0);
  const totalLikes   = officialPosts.reduce((s, p) => s + (p.likeCount || 0), 0);
  const totalFwd     = officialPosts.reduce((s, p) => s + (p.retweetCount || 0), 0);

  // Top post by engagement
  const topPost = useMemo(
    () => [...officialPosts].sort((a, b) => (b.viewCount + b.likeCount * 3 + b.retweetCount * 2) - (a.viewCount + a.likeCount * 3 + a.retweetCount * 2))[0] || null,
    [officialPosts],
  );

  if (loading) {
    return (
      <Card sx={{ p: 2.5, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120, borderRadius: 2.5, boxShadow: theme.shadows[2] }}>
        <CircularProgress />
      </Card>
    );
  }

  if (officialPosts.length === 0) {
    return (
      <Card sx={{ borderRadius: 2.5, overflow: 'hidden', boxShadow: theme.shadows[2] }}>
        <Box sx={{ p: 2.5, background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.08)} 0%, ${alpha(theme.palette.success.main, 0.08)} 100%)` }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{ width: 40, height: 40, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.warning.main, 0.16) }}>
              <Iconify icon="solar:chart-square-bold-duotone" width={24} sx={{ color: theme.palette.warning.main }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>تحلیل محتوای منتشرشده</Typography>
              <InfoTooltip title={WIDGET_TOOLTIPS.contentAnalysis} />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>الگوهای انتشار صفحات رسمی</Typography>
            </Box>
          </Stack>
        </Box>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Iconify icon="solar:chart-square-bold-duotone" width={40} sx={{ color: 'text.disabled', mb: 1.5 }} />
          <Typography variant="body2" color="text.secondary">داده‌ای برای نمایش وجود ندارد.</Typography>
          <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5 }}>
            پس از اتصال صفحات رسمی، آمار انتشار اینجا نمایش داده می‌شود.
          </Typography>
        </Box>
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: 2.5, overflow: 'hidden', boxShadow: theme.shadows[2] }}>
      {/* Header */}
      <Box sx={{ p: 2.5, background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.08)} 0%, ${alpha(theme.palette.success.main, 0.08)} 100%)` }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{ width: 40, height: 40, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.warning.main, 0.16) }}>
              <Iconify icon="solar:chart-square-bold-duotone" width={24} sx={{ color: theme.palette.warning.main }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>تحلیل محتوای منتشرشده</Typography>
              <InfoTooltip title={WIDGET_TOOLTIPS.contentAnalysis} />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {totalPosts.toLocaleString('fa-IR')} پست · {formatNum(totalViews)} بازدید
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ p: 2.5 }}>
        {/* Summary stat row */}
        <Stack direction="row" spacing={1} sx={{ mb: 2.5 }}>
          {[
            { icon: 'solar:document-text-bold', label: 'پست', value: totalPosts, color: theme.palette.primary.main },
            { icon: 'solar:eye-bold', label: 'بازدید', value: totalViews, color: theme.palette.info.main },
            { icon: 'solar:like-bold', label: 'لایک', value: totalLikes, color: theme.palette.success.main },
            { icon: 'solar:share-bold', label: 'بازنشر', value: totalFwd, color: theme.palette.warning.main },
          ].map(({ icon, label, value, color }) => (
            <Box key={label} sx={{ flex: 1, p: 1.25, borderRadius: 1.5, bgcolor: alpha(color, 0.06), border: `1px solid ${alpha(color, 0.14)}`, textAlign: 'center' }}>
              <Iconify icon={icon} width={16} sx={{ color, mb: 0.25 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color, fontSize: 15, lineHeight: 1 }}>{formatNum(value)}</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 9 }}>{label}</Typography>
            </Box>
          ))}
        </Stack>

        {/* Per-source breakdown */}
        {bySource.length > 1 && (
          <Box sx={{ mb: 2.5 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 1 }}>
              توزیع منابع
            </Typography>
            <Stack spacing={0.75}>
              {bySource.map((src) => {
                const meta = SOURCE_META[src.source] || { label: src.source, color: '#868E96' };
                const pct = Math.round((src.count / totalPosts) * 100);
                return (
                  <Stack key={src.source} direction="row" alignItems="center" spacing={1}>
                    <SourceIcon source={src.source} size={14} />
                    <Typography variant="caption" sx={{ minWidth: 70, color: 'text.secondary', fontSize: 10 }}>{meta.label}</Typography>
                    <Box sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: alpha(theme.palette.grey[500], 0.12), overflow: 'hidden' }}>
                      <Box sx={{ width: `${pct}%`, height: '100%', borderRadius: 3, bgcolor: meta.color, transition: 'width 0.6s ease' }} />
                    </Box>
                    <Typography variant="caption" sx={{ minWidth: 28, color: 'text.secondary', fontSize: 10, textAlign: 'left' }}>{pct}%</Typography>
                    <Typography variant="caption" sx={{ minWidth: 32, color: 'text.disabled', fontSize: 10, textAlign: 'left' }}>{src.count}</Typography>
                  </Stack>
                );
              })}
            </Stack>
          </Box>
        )}

        {/* Weekly activity chart */}
        <Box sx={{ mb: 2.5 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              فعالیت هفتگی (۱۲ هفته اخیر)
            </Typography>
            <Stack direction="row" spacing={0.5}>
              {[{ key: 'count', label: 'پست' }, { key: 'views', label: 'بازدید' }].map(({ key, label }) => (
                <Chip
                  key={key}
                  size="small"
                  label={label}
                  onClick={() => setMetric(key)}
                  variant={metric === key ? 'filled' : 'outlined'}
                  color={metric === key ? 'primary' : 'default'}
                  sx={{ fontSize: 9, height: 20, cursor: 'pointer' }}
                />
              ))}
            </Stack>
          </Stack>

          <Stack direction="row" alignItems="flex-end" spacing={0.5} sx={{ height: 60 }}>
            {weeks.map((w, i) => {
              const val = metric === 'views' ? w.views : w.count;
              const h = maxVal > 0 ? Math.max((val / maxVal) * 100, val > 0 ? 4 : 0) : 0;
              const color = theme.palette.primary.main;
              return (
                <Tooltip key={i} title={`${w.label}: ${metric === 'views' ? formatNum(val) : val.toLocaleString('fa-IR')} ${metric === 'views' ? 'بازدید' : 'پست'}`} placement="top" arrow>
                  <Box
                    sx={{
                      flex: 1, height: `${h}%`, minHeight: val > 0 ? 3 : 0,
                      borderRadius: '2px 2px 0 0',
                      bgcolor: val > 0 ? alpha(color, 0.7) : alpha(theme.palette.grey[500], 0.1),
                      transition: 'height 0.4s ease',
                      cursor: 'default',
                      '&:hover': { bgcolor: color },
                    }}
                  />
                </Tooltip>
              );
            })}
          </Stack>
          {/* x-axis labels: first, middle, last */}
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.5 }}>
            <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 8 }}>۱۲ هفته پیش</Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 8 }}>این هفته</Typography>
          </Stack>
        </Box>

        {/* Top post */}
        {topPost && (
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 1 }}>
              پربازدیدترین پست
            </Typography>
            <Box
              sx={{
                p: 1.5, borderRadius: 1.5,
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.75 }}>
                <SourceIcon source={topPost.sourceType} size={13} />
                <Typography variant="caption" sx={{ fontWeight: 600, fontSize: 10, color: 'text.secondary', direction: 'ltr' }}>
                  @{topPost.screenName}
                </Typography>
                <Box sx={{ flex: 1 }} />
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Iconify icon="solar:eye-bold" width={10} sx={{ color: 'text.disabled' }} />
                  <Typography variant="caption" sx={{ fontSize: 10, color: 'text.secondary', fontWeight: 600 }}>
                    {formatNum(topPost.viewCount)}
                  </Typography>
                </Stack>
                {topPost.likeCount > 0 && (
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Iconify icon="solar:like-bold" width={10} sx={{ color: 'text.disabled' }} />
                    <Typography variant="caption" sx={{ fontSize: 10, color: 'text.secondary', fontWeight: 600 }}>
                      {formatNum(topPost.likeCount)}
                    </Typography>
                  </Stack>
                )}
              </Stack>
              <Typography
                variant="caption"
                sx={{ fontSize: 11, color: 'text.primary', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.6 }}
              >
                {topPost.text}
              </Typography>
              {topPost.postUrl && (
                <Box sx={{ mt: 0.75 }}>
                  <Typography
                    component="a"
                    href={topPost.postUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="caption"
                    sx={{ fontSize: 9, color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                  >
                    مشاهده پست ←
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Card>
  );
}
