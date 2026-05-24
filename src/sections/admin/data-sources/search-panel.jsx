'use client';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { useSearchDataSource } from 'src/api/admin';

import { Iconify } from 'src/components/iconify';
import { SvgColor } from 'src/components/svg-color';

import { PostCard, usePostDrawer } from 'src/sections/cyberspace/shared/post-card';

// ----------------------------------------------------------------------
// Source definitions — 4 rows as specified
// ----------------------------------------------------------------------

const SOURCE_ROWS = [
  [
    { value: 'twitter',   label: 'ایکس',        icon: 'ri:twitter-x-fill',                    color: '#000000' },
    { value: 'instagram', label: 'اینستاگرام',  icon: 'mdi:instagram',                         color: '#E4405F' },
    { value: 'telegram',  label: 'تلگرام',       icon: 'ic:baseline-telegram',                  color: '#0088cc' },
  ],
  [
    { value: 'news',      label: 'خبرگزاری',    icon: 'solar:document-text-bold',              color: '#4CAF50' },
    { value: 'newspaper', label: 'روزنامه',      icon: 'solar:global-bold-duotone',             color: '#78909C' },
    { value: 'media',     label: 'صدا و سیما',  icon: 'solar:tv-bold-duotone',                 color: '#FF5722' },
  ],
  [
    { value: 'eitaa',  label: 'ایتا',   svg: '/assets/icons/social/eitaa-mono.svg',  color: '#F57C00' },
    { value: 'rubika', label: 'روبیکا', svg: '/assets/icons/social/rubika-mono.svg', color: '#7C3AED' },
    { value: 'bale',   label: 'بله',    svg: '/assets/icons/social/bale-mono.svg',   color: '#00A86B' },
  ],
  [
    { value: 'comments', label: 'کامنت‌ها',           icon: 'solar:chat-line-bold-duotone',         color: '#ADB5BD', disabled: true },
    { value: 'forum',    label: 'فروم',                icon: 'solar:chat-square-bold-duotone',       color: '#795548' },
    { value: 'aparat',   label: 'پلتفرم‌های ویدئویی', icon: 'solar:videocamera-record-bold-duotone', color: '#FF5722' },
  ],
];

const SORTS_BY_SOURCE = {
  telegram: [
    { value: 'recent', label: 'جدیدترین' }, { value: 'old', label: 'قدیمی‌ترین' },
    { value: 'score', label: 'بیشترین انطباق' }, { value: 'random', label: 'تصادفی' },
    { value: 'comments', label: 'بیشترین کامنت' }, { value: 'member', label: 'بیشترین عضو' },
    { value: 'forwards', label: 'بیشترین بازنشر' }, { value: 'reactions', label: 'بیشترین ری‌اکشن' },
    { value: 'views', label: 'بیشترین بازدید' }, { value: 'engagement', label: 'بیشترین تعامل' },
  ],
  bale: [
    { value: 'recent', label: 'جدیدترین' }, { value: 'old', label: 'قدیمی‌ترین' },
    { value: 'score', label: 'بیشترین انطباق' }, { value: 'random', label: 'تصادفی' },
    { value: 'member', label: 'بیشترین عضو' }, { value: 'views', label: 'بیشترین بازدید' },
    { value: 'reactions', label: 'بیشترین ری‌اکشن' }, { value: 'engagement', label: 'بیشترین تعامل' },
  ],
  rubika: [
    { value: 'recent', label: 'جدیدترین' }, { value: 'old', label: 'قدیمی‌ترین' },
    { value: 'score', label: 'بیشترین انطباق' }, { value: 'random', label: 'تصادفی' },
    { value: 'member', label: 'بیشترین عضو' }, { value: 'reactions', label: 'بیشترین ری‌اکشن' },
    { value: 'views', label: 'بیشترین بازدید' }, { value: 'engagement', label: 'بیشترین تعامل' },
  ],
  eitaa: [
    { value: 'recent', label: 'جدیدترین' }, { value: 'old', label: 'قدیمی‌ترین' },
    { value: 'score', label: 'بیشترین انطباق' }, { value: 'random', label: 'تصادفی' },
    { value: 'member', label: 'بیشترین عضو' }, { value: 'views', label: 'بیشترین بازدید' },
  ],
  twitter: [
    { value: 'recent', label: 'جدیدترین' }, { value: 'old', label: 'قدیمی‌ترین' },
    { value: 'score', label: 'بیشترین انطباق' }, { value: 'random', label: 'تصادفی' },
    { value: 'likes', label: 'بیشترین لایک' }, { value: 'comments', label: 'بیشترین کامنت' },
    { value: 'forwards', label: 'بیشترین بازنشر' }, { value: 'followers', label: 'بیشترین فالور' },
    { value: 'bookmarks', label: 'بیشترین بوکمارک' }, { value: 'views', label: 'بیشترین بازدید' },
    { value: 'engagement', label: 'بیشترین تعامل' },
  ],
  instagram: [
    { value: 'recent', label: 'جدیدترین' }, { value: 'old', label: 'قدیمی‌ترین' },
    { value: 'score', label: 'بیشترین انطباق' }, { value: 'random', label: 'تصادفی' },
    { value: 'likes', label: 'بیشترین لایک' }, { value: 'comments', label: 'بیشترین کامنت' },
    { value: 'followers', label: 'بیشترین فالور' }, { value: 'forwards', label: 'بیشترین بازنشر' },
    { value: 'views', label: 'بیشترین بازدید' }, { value: 'engagement', label: 'بیشترین تعامل' },
  ],
  news: [
    { value: 'recent', label: 'جدیدترین' }, { value: 'old', label: 'قدیمی‌ترین' },
    { value: 'random', label: 'تصادفی' }, { value: 'likes', label: 'بیشترین لایک' },
    { value: 'views', label: 'بیشترین بازدید' }, { value: 'engagement', label: 'بیشترین تعامل' },
    { value: 'comments', label: 'بیشترین کامنت' }, { value: 'score', label: 'بیشترین انطباق' },
    { value: 'source_influence', label: 'ضریب نفوذ منبع' }, { value: 'copies', label: 'بیشترین کپی' },
  ],
  newspaper: [{ value: 'recent', label: 'جدیدترین' }, { value: 'old', label: 'قدیمی‌ترین' }],
  media: [
    { value: 'recent', label: 'جدیدترین' }, { value: 'old', label: 'قدیمی‌ترین' },
    { value: 'score', label: 'بیشترین انطباق' }, { value: 'views', label: 'بیشترین بازدید' },
    { value: 'engagement', label: 'بیشترین تعامل' },
  ],
  forum: [
    { value: 'recent', label: 'جدیدترین' }, { value: 'old', label: 'قدیمی‌ترین' },
    { value: 'score', label: 'بیشترین انطباق' }, { value: 'views', label: 'بیشترین بازدید' },
    { value: 'engagement', label: 'بیشترین تعامل' },
  ],
  aparat: [
    { value: 'recent', label: 'جدیدترین' }, { value: 'old', label: 'قدیمی‌ترین' },
    { value: 'views', label: 'بیشترین بازدید' }, { value: 'engagement', label: 'بیشترین تعامل' },
  ],
};

const RANGES = [
  { value: 'day', label: 'امروز' }, { value: 'yesterday', label: 'دیروز' },
  { value: 'week', label: '۷ روز گذشته' }, { value: 'month', label: '۳۰ روز گذشته' },
  { value: 'year', label: '۳۶۵ روز گذشته' }, { value: 'all', label: 'همه' },
];

// ----------------------------------------------------------------------
// Source pill
// ----------------------------------------------------------------------

function SourcePill({ source, selected, onClick }) {
  const theme = useTheme();
  return (
    <Box
      onClick={source.disabled ? undefined : onClick}
      sx={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 0.5, p: 1, borderRadius: 1.5,
        cursor: source.disabled ? 'not-allowed' : 'pointer',
        border: `1.5px solid ${selected ? source.color : alpha(theme.palette.grey[500], 0.2)}`,
        bgcolor: selected ? alpha(source.color, 0.1) : alpha(theme.palette.grey[500], 0.03),
        opacity: source.disabled ? 0.4 : 1,
        transition: 'all 0.15s',
        minWidth: 72, flex: 1,
        '&:hover': source.disabled ? {} : {
          bgcolor: alpha(source.color, selected ? 0.14 : 0.06),
          borderColor: source.color,
        },
      }}
    >
      <Box sx={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {source.svg ? (
          <SvgColor src={source.svg} sx={{ width: 20, height: 20, color: selected ? source.color : 'text.disabled' }} />
        ) : (
          <Iconify icon={source.icon} width={20} sx={{ color: selected ? source.color : 'text.disabled' }} />
        )}
      </Box>
      <Typography variant="caption" sx={{ fontSize: 9, fontWeight: selected ? 700 : 500, color: selected ? source.color : 'text.secondary', lineHeight: 1.2, textAlign: 'center' }}>
        {source.label}
      </Typography>
    </Box>
  );
}

// ----------------------------------------------------------------------
// Main panel
// ----------------------------------------------------------------------

export function EightTagSearchPanel({ dataSourceId, profileKeywords = [], profileExcluded = [], profileName = null }) {
  const theme = useTheme();
  const search = useSearchDataSource();
  const { openPost, PostDrawer } = usePostDrawer();
  const [selectedSources, setSelectedSources] = useState(['telegram']);
  const [form, setForm] = useState({ or: '', and: '', not: '', range: 'week', sort: 'recent', size: 50, lang: 'fa', forward: 'false', retweet: 'false', minViews: '', minLikes: '', minFollowers: '', maxHashtags: 10 });
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const prevProfileRef = React.useRef(null);
  React.useEffect(() => {
    const newKey = profileKeywords.join('|') + '::' + profileExcluded.join('|');
    if (newKey === prevProfileRef.current) return;
    prevProfileRef.current = newKey;
    setForm((f) => ({
      ...f,
      or: profileKeywords.length ? profileKeywords.join('|') : f.or,
      not: profileExcluded.join('|'), // always update not, even if empty
    }));
    setResults(null);
  }, [profileKeywords, profileExcluded]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const toggleSource = (value) => {
    // Allow deselecting all sources — empty = search all sources
    setSelectedSources((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  };

  const sortOptions = React.useMemo(() => {
    if (selectedSources.length === 0) return [{ value: 'recent', label: 'جدیدترین' }, { value: 'old', label: 'قدیمی‌ترین' }];
    if (selectedSources.length === 1) return SORTS_BY_SOURCE[selectedSources[0]] || [{ value: 'recent', label: 'جدیدترین' }];
    const sets = selectedSources.map((s) => new Set((SORTS_BY_SOURCE[s] || []).map((o) => o.value)));
    const common = (SORTS_BY_SOURCE[selectedSources[0]] || []).filter((o) => sets.every((s) => s.has(o.value)));
    return common.length ? common : [{ value: 'recent', label: 'جدیدترین' }, { value: 'old', label: 'قدیمی‌ترین' }];
  }, [selectedSources]);

  React.useEffect(() => {
    if (!sortOptions.map((o) => o.value).includes(form.sort)) set({ sort: 'recent' });
  }, [sortOptions]);

  const run = async () => {
    setError(null); setResults(null);
    try {
      // Empty selectedSources = all sources (omit source param)
      const sourceParam = selectedSources.length === 0
        ? undefined
        : selectedSources.length === 1 ? selectedSources[0] : selectedSources;
      const params = { ...form, ...(sourceParam !== undefined ? { source: sourceParam } : {}) };
      Object.keys(params).forEach((k) => { if (params[k] === '' || params[k] === null || params[k] === undefined) delete params[k]; });
      const r = await search.mutateAsync({ id: dataSourceId, params });
      setResults(r);
    } catch (e) { setError(typeof e === 'string' ? e : e?.message || 'خطا در جستجو'); }
  };

  const posts = results?.data ?? [];
  const total = results?.total ?? 0;
  // Parse the active `or` keywords for highlighting
  const highlightKeywords = form.or ? form.or.split('|').map((k) => k.trim()).filter(Boolean) : [];

  return (
    <Box sx={{ borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.03), border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`, overflow: 'hidden' }}>
      <Box sx={{ px: 2, py: 1.5, background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.06)} 0%, ${alpha(theme.palette.info.main, 0.04)} 100%)`, borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="solar:magnifer-bold-duotone" width={20} sx={{ color: 'primary.main' }} />
          <Typography variant="subtitle2" fontWeight={700}>جستجوی آنلاین ۸تگ</Typography>
          {profileName && <Chip size="small" label={profileName} color="primary" variant="outlined" sx={{ ml: 1 }} />}
          {selectedSources.length === 0
            ? <Chip size="small" label="همه منابع" color="warning" variant="outlined" />
            : selectedSources.length > 1 && <Chip size="small" label={`${selectedSources.length} منبع`} color="info" variant="outlined" />
          }
        </Stack>
      </Box>

      <Box sx={{ p: 2 }}>
        {/* Source pill grid */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
            منابع — کلیک برای انتخاب/حذف، بدون انتخاب = همه منابع
          </Typography>
          <Stack spacing={1}>
            {SOURCE_ROWS.map((row, ri) => (
              <Stack key={ri} direction="row" spacing={1}>
                {row.map((src) => (
                  <SourcePill key={src.value} source={src} selected={selectedSources.includes(src.value)} onClick={() => toggleSource(src.value)} />
                ))}
              </Stack>
            ))}
          </Stack>
        </Box>

        {/* Search params */}
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          <Grid size={{ xs: 6 }}>
            <FormControl fullWidth size="small">
              <InputLabel>بازه زمانی</InputLabel>
              <Select value={form.range} label="بازه زمانی" onChange={(e) => set({ range: e.target.value })}>
                {RANGES.map((r) => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <FormControl fullWidth size="small">
              <InputLabel>ترتیب</InputLabel>
              <Select value={form.sort} label="ترتیب" onChange={(e) => set({ sort: e.target.value })}>
                {sortOptions.map((s) => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="حداقل یکی (or)" value={form.or} onChange={(e) => set({ or: e.target.value })} fullWidth size="small" placeholder="قالیباف|مجلس" slotProps={{ input: { style: { direction: 'rtl' } } }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="هیچ‌کدام نباشند (not)" value={form.not} onChange={(e) => set({ not: e.target.value })} fullWidth size="small" placeholder="تبلیغ|اسپم" slotProps={{ input: { style: { direction: 'rtl' } } }} />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <TextField label="حداقل بازدید" type="number" value={form.minViews} onChange={(e) => set({ minViews: e.target.value })} fullWidth size="small" placeholder="۱۰۰۰" slotProps={{ htmlInput: { min: 0 } }} />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <TextField label="حداقل لایک/ری‌اکشن" type="number" value={form.minLikes} onChange={(e) => set({ minLikes: e.target.value })} fullWidth size="small" placeholder="۵۰" slotProps={{ htmlInput: { min: 0 } }} />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <TextField label="حداقل فالور" type="number" value={form.minFollowers} onChange={(e) => set({ minFollowers: e.target.value })} fullWidth size="small" placeholder="۱۰۰۰" slotProps={{ htmlInput: { min: 0 } }} />
          </Grid>
        </Grid>

        {error && (
          <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: alpha(theme.palette.error.main, 0.08), mb: 1.5 }}>
            <Typography variant="body2" color="error.main">{error}</Typography>
          </Box>
        )}

        {/* تعداد نتایج + search button + result chips — all on one line */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap' }}>
          <TextField
            label="تعداد نتایج"
            type="number"
            value={form.size}
            onChange={(e) => set({ size: Math.min(1000, Math.max(1, parseInt(e.target.value) || 50)) })}
            size="small"
            sx={{ width: 110 }}
            slotProps={{ htmlInput: { min: 1, max: 1000 } }}
          />
          <Button
            variant="contained"
            onClick={run}
            disabled={search.isPending}
            startIcon={search.isPending ? <CircularProgress size={16} color="inherit" /> : <Iconify icon="solar:magnifer-bold" width={18} />}
            size="small"
          >
            {search.isPending ? 'در حال جستجو...' : 'جستجو'}
          </Button>
          {results?.thresholdApplied && (
            <Chip size="small" color="warning" variant="outlined"
              label={`فیلتر: ${results.thresholdApplied.field} ≥ ${results.thresholdApplied.min.toLocaleString('fa-IR')}`}
            />
          )}
          {results && <Chip size="small" label={`${posts.length} نمایش`} />}
          {results && <Chip size="small" color="primary" variant="outlined" label={`${total.toLocaleString('fa-IR')} کل`} />}
        </Stack>

        {results && posts.length === 0 && (
          <Box sx={{ py: 3, textAlign: 'center' }}>
            <Iconify icon="solar:magnifer-bold-duotone" width={36} sx={{ color: 'text.disabled', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">نتیجه‌ای یافت نشد.</Typography>
          </Box>
        )}

        {results && posts.length > 0 && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 1.5, mt: 1.5 }}>
            {posts.map((item, idx) => {
              const post = { ...item, highlights: highlightKeywords };
              return (
                <PostCard key={item.id != null ? String(item.id) : `result-${idx}`} post={post} onClick={() => openPost(post)} compact />
              );
            })}
          </Box>
        )}
        {PostDrawer}
      </Box>
    </Box>
  );
}
