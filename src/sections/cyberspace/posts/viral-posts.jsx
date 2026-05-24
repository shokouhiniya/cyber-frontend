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
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { useTopForwarded } from 'src/api/dashboard';

import { Iconify } from 'src/components/iconify';

import { PostCard, formatNum, usePostDrawer } from '../shared/post-card';

// ----------------------------------------------------------------------

const TIME_FILTERS = [
  { value: '24h', label: 'امروز',  hours: 24 },
  { value: '7d',  label: '۷ روز',  hours: 24 * 7 },
  { value: '30d', label: '۳۰ روز', hours: 24 * 30 },
  { value: 'all', label: 'همه',    hours: null },
];

function getSince(hours) {
  if (!hours) return undefined;
  const d = new Date(Date.now() - hours * 3600_000);
  d.setMinutes(0, 0, 0);
  return d.toISOString();
}

export function ViralPosts() {
  const theme = useTheme();
  const { openPost, PostDrawer } = usePostDrawer();
  const [sectionOpen, setSectionOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [timeFilter, setTimeFilter] = useState('24h');

  const { data: posts = [], isLoading } = useTopForwarded(20, timeFilter);

  const displayedPosts = expanded ? posts : posts.slice(0, 8);

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
            {/* Timeframe chips */}
            <Stack direction="row" spacing={0.75} sx={{ mb: 1.5 }}>
              {TIME_FILTERS.map((f) => (
                <Chip
                  key={f.value}
                  size="small"
                  label={f.label}
                  onClick={(e) => { e.stopPropagation(); setTimeFilter(f.value); setExpanded(false); }}
                  variant={timeFilter === f.value ? 'filled' : 'outlined'}
                  color={timeFilter === f.value ? 'primary' : 'default'}
                  sx={{ fontSize: 10, height: 22, cursor: 'pointer' }}
                />
              ))}
            </Stack>

            {isLoading ? (
              <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={24} />
              </Box>
            ) : posts.length === 0 ? (
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
                {!expanded && posts.length > 8 && (
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Button variant="outlined" size="small" fullWidth onClick={() => setExpanded(true)} startIcon={<Iconify icon="solar:arrow-down-bold" width={16} />} sx={{ fontSize: 11, fontWeight: 600, borderRadius: 1.5 }}>
                      {posts.length - 8} پست دیگر
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
