'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import ButtonGroup from '@mui/material/ButtonGroup';
import InputAdornment from '@mui/material/InputAdornment';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

import { PostCard, usePostDrawer, getSentimentConfig } from '../shared/post-card';

// ----------------------------------------------------------------------

const TIME_FILTERS = [
  { value: '24h', label: '۲۴ ساعت' },
  { value: '7d', label: 'هفته پیش' },
  { value: '30d', label: 'ماه پیش' },
  { value: 'all', label: 'کل بازه' },
];

const FILTER_EMOTIONS = ['joy', 'hope', 'excitement', 'concern', 'worry', 'frustration'];

export function PostsList({ data, loading, total, filters, timeFilter, onTimeFilterChange }) {
  const theme = useTheme();
  const { openPost, PostDrawer } = usePostDrawer();
  const [sectionOpen, setSectionOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('');
  const [showCount, setShowCount] = useState(12);

  if (loading) {
    return (
      <Card sx={{ p: 2.5, display: 'flex', justifyContent: 'center', minHeight: 120, borderRadius: 2.5, boxShadow: theme.shadows[2] }}>
        <CircularProgress />
      </Card>
    );
  }

  let filtered = data;
  if (localSearch) {
    const q = localSearch.toLowerCase();
    filtered = filtered.filter((p) => p.text?.toLowerCase().includes(q) || p.screenName?.toLowerCase().includes(q));
  }
  if (sentimentFilter) {
    filtered = filtered.filter((p) => (p.emotion || '').toLowerCase() === sentimentFilter);
  }

  const sorted = [...filtered].sort(
    (a, b) => ((b.viewCount || 0) + (b.likeCount || 0) + (b.retweetCount || 0)) - ((a.viewCount || 0) + (a.likeCount || 0) + (a.retweetCount || 0))
  );

  const displayed = sorted.slice(0, showCount);
  const hasMore = showCount < sorted.length;

  return (
    <>
      <Card sx={{ borderRadius: 2.5, overflow: 'hidden', boxShadow: theme.shadows[2] }}>
        <ButtonBase component="div" onClick={() => setSectionOpen((prev) => !prev)}
          sx={{ width: '100%', p: 2.5, display: 'block', textAlign: 'start', background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.08)} 0%, ${alpha(theme.palette.warning.main, 0.08)} 100%)` }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box sx={{ width: 40, height: 40, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.success.main, 0.16) }}>
                <Iconify icon="solar:chat-round-line-bold-duotone" width={24} sx={{ color: theme.palette.success.main }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>پربازدیدترین پست‌ها</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>{(total || 0).toLocaleString('fa-IR')} پست</Typography>
              </Box>
            </Stack>
            <Iconify icon={sectionOpen ? 'solar:alt-arrow-up-bold' : 'solar:alt-arrow-down-bold'} width={20} sx={{ color: 'text.secondary' }} />
          </Stack>
        </ButtonBase>

        <Collapse in={sectionOpen} timeout={350}>
          <Box sx={{ p: 2, pt: 1.5 }}>
            <ButtonGroup variant="outlined" size="small" fullWidth sx={{ mb: 1.5, '& .MuiButton-root': { fontSize: 9, fontWeight: 600, borderColor: alpha(theme.palette.primary.main, 0.16), color: 'text.secondary', '&.active': { bgcolor: alpha(theme.palette.primary.main, 0.12), borderColor: theme.palette.primary.main, color: theme.palette.primary.main, fontWeight: 700 } } }}>
              {TIME_FILTERS.map((f) => (
                <Button key={f.value} className={timeFilter === f.value ? 'active' : ''} onClick={(e) => { e.stopPropagation(); onTimeFilterChange(f.value); }}>{f.label}</Button>
              ))}
            </ButtonGroup>

            <TextField size="small" fullWidth placeholder="جستجو در پست‌ها..." value={localSearch} onChange={(e) => setLocalSearch(e.target.value)}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><Iconify icon="solar:magnifer-bold-duotone" width={16} sx={{ color: 'text.disabled' }} /></InputAdornment> } }}
              sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: 12 } }}
            />

            <Box sx={{ overflow: 'auto', pb: 1, mb: 1, mx: -0.5, px: 0.5 }}>
              <Stack direction="row" spacing={0.75} sx={{ minWidth: 'max-content' }}>
                {FILTER_EMOTIONS.map((key) => {
                  const conf = getSentimentConfig(key);
                  return (
                    <Chip key={key} label={conf.label} size="small" variant={sentimentFilter === key ? 'filled' : 'outlined'}
                      icon={<Iconify icon={conf.icon} width={12} />}
                      onClick={() => setSentimentFilter(sentimentFilter === key ? '' : key)}
                      sx={{ height: 26, fontSize: 10, fontWeight: 600, ...(sentimentFilter === key && { bgcolor: alpha(conf.color, 0.16), color: conf.color, borderColor: conf.color }), '& .MuiChip-icon': { color: sentimentFilter === key ? conf.color : 'text.secondary' } }}
                    />
                  );
                })}
              </Stack>
            </Box>

            <Stack spacing={1.5}>
              {displayed.map((post) => (
                <PostCard key={post.id} post={post} onClick={() => openPost(post)} />
              ))}
            </Stack>

            {sorted.length === 0 && (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Iconify icon="solar:inbox-line-bold-duotone" width={48} sx={{ color: 'text.disabled', mb: 1 }} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>پستی یافت نشد</Typography>
              </Box>
            )}

            {hasMore && (
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Button variant="outlined" size="small" fullWidth onClick={() => setShowCount((c) => c + 12)} startIcon={<Iconify icon="solar:arrow-down-bold" width={16} />} sx={{ fontSize: 11, fontWeight: 600, borderRadius: 1.5 }}>
                  بارگذاری بیشتر
                </Button>
              </Box>
            )}
          </Box>
        </Collapse>
      </Card>
      {PostDrawer}
    </>
  );
}
