'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import ButtonGroup from '@mui/material/ButtonGroup';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

import { PostCard, usePostDrawer, formatNum } from '../shared/post-card';

// ----------------------------------------------------------------------

const TIME_FILTERS = [
  { value: '24h', label: '۲۴ ساعت' },
  { value: '7d', label: 'هفته پیش' },
  { value: '30d', label: 'ماه پیش' },
  { value: 'all', label: 'کل بازه' },
];

function filterByTime(posts, tf) {
  if (tf === 'all') return posts;
  const ms = { '24h': 24 * 3600000, '7d': 7 * 86400000, '30d': 30 * 86400000 }[tf];
  if (!ms) return posts;
  const cutoff = Date.now() - ms;
  return posts.filter((p) => p.publishedAt && new Date(p.publishedAt).getTime() >= cutoff);
}

export function ViralPosts({ data, loading }) {
  const theme = useTheme();
  const { openPost, PostDrawer } = usePostDrawer();
  const [sectionOpen, setSectionOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [timeFilter, setTimeFilter] = useState('all');

  if (loading) {
    return (
      <Card sx={{ p: 2.5, display: 'flex', justifyContent: 'center', minHeight: 120, borderRadius: 2.5, boxShadow: theme.shadows[2] }}>
        <CircularProgress />
      </Card>
    );
  }

  const timeFiltered = filterByTime(data, timeFilter);
  const scored = timeFiltered
    .filter((p) => (p.retweetCount || 0) > 0 || (p.viewCount || 0) > 0)
    .map((post) => ({ ...post, viralScore: (post.retweetCount || 0) * 20 + (post.viewCount || 0) }))
    .sort((a, b) => b.viralScore - a.viralScore);

  const displayedPosts = expanded ? scored : scored.slice(0, 8);

  return (
    <>
      <Card sx={{ borderRadius: 2.5, overflow: 'hidden', boxShadow: theme.shadows[2] }}>
        <ButtonBase component="div" onClick={() => setSectionOpen((prev) => !prev)}
          sx={{ width: '100%', p: 2.5, display: 'block', textAlign: 'start', background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.08)} 0%, ${alpha(theme.palette.warning.main, 0.08)} 100%)` }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box sx={{ width: 40, height: 40, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.info.main, 0.16) }}>
                <Iconify icon="solar:share-circle-bold-duotone" width={24} sx={{ color: theme.palette.info.main }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>پرتکرارترین پست‌ها</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>بیشترین بازنشر و پوشش رسانه‌ای</Typography>
              </Box>
            </Stack>
            <Iconify icon={sectionOpen ? 'solar:alt-arrow-up-bold' : 'solar:alt-arrow-down-bold'} width={20} sx={{ color: 'text.secondary' }} />
          </Stack>
        </ButtonBase>

        <Collapse in={sectionOpen} timeout={350}>
          <Box sx={{ p: 2, pt: 1.5 }}>
            <ButtonGroup variant="outlined" size="small" fullWidth sx={{ mb: 2, '& .MuiButton-root': { fontSize: 9, fontWeight: 600, borderColor: alpha(theme.palette.primary.main, 0.16), color: 'text.secondary', '&.active': { bgcolor: alpha(theme.palette.primary.main, 0.12), borderColor: theme.palette.primary.main, color: theme.palette.primary.main, fontWeight: 700 } } }}>
              {TIME_FILTERS.map((f) => (
                <Button key={f.value} className={timeFilter === f.value ? 'active' : ''} onClick={(e) => { e.stopPropagation(); setTimeFilter(f.value); }}>{f.label}</Button>
              ))}
            </ButtonGroup>

            {scored.length === 0 ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Iconify icon="solar:inbox-line-bold-duotone" width={48} sx={{ color: 'text.disabled', mb: 1 }} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>پستی یافت نشد</Typography>
              </Box>
            ) : (
              <>
                <Stack spacing={1.5}>
                  {displayedPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onClick={() => openPost(post)}
                      badge={
                        <Stack direction="row" spacing={0.5}>
                          <Chip icon={<Iconify icon="solar:share-bold" width={10} />} label={`${formatNum(post.retweetCount)} بازنشر`} size="small"
                            sx={{ height: 20, fontSize: 8, fontWeight: 700, bgcolor: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.main, '& .MuiChip-icon': { color: theme.palette.warning.main } }}
                          />
                        </Stack>
                      }
                    />
                  ))}
                </Stack>
                {!expanded && scored.length > 8 && (
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Button variant="outlined" size="small" fullWidth onClick={() => setExpanded(true)} startIcon={<Iconify icon="solar:arrow-down-bold" width={16} />} sx={{ fontSize: 11, fontWeight: 600, borderRadius: 1.5 }}>
                      {scored.length - 8} پست دیگر
                    </Button>
                  </Box>
                )}
              </>
            )}
          </Box>
        </Collapse>
      </Card>
      {PostDrawer}
    </>
  );
}
