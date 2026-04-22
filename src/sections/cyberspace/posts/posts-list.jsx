import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ButtonBase from '@mui/material/ButtonBase';
import ButtonGroup from '@mui/material/ButtonGroup';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const emotionConfig = {
  ANGRY: { color: '#FF6B6B', icon: 'solar:danger-triangle-bold', label: 'منفی' },
  HAPPY: { color: '#51CF66', icon: 'solar:check-circle-bold', label: 'مثبت' },
  HOPE: { color: '#74C0FC', icon: 'solar:star-bold', label: 'امیدوار' },
  SAD: { color: '#845EF7', icon: 'solar:sad-circle-bold', label: 'غمگین' },
  FEAR: { color: '#FFA94D', icon: 'solar:shield-warning-bold', label: 'ترس' },
  SURPRISE: { color: '#20C997', icon: 'solar:star-shine-bold', label: 'شگفتی' },
  HATE: { color: '#E03131', icon: 'solar:fire-bold', label: 'نفرت' },
  OTHER: { color: '#ADB5BD', icon: 'solar:minus-circle-bold', label: 'خنثی' },
};

const TIME_FILTERS = [
  { value: '24h', label: '۲۴ ساعت' },
  { value: '7d', label: 'هفته پیش' },
  { value: '30d', label: 'ماه پیش' },
  { value: 'all', label: 'کل بازه' },
];

// ----------------------------------------------------------------------

export function PostsList({ data, loading, total, filters, timeFilter, onTimeFilterChange, onSearchOpen, onClearSearch }) {
  const theme = useTheme();
  const [sectionOpen, setSectionOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    positive: false,
    negative: false,
    neutral: false,
    highEngagement: false,
    verified: false,
  });

  if (loading) {
    return (
      <Card sx={{ p: 2.5, display: 'flex', justifyContent: 'center', minHeight: 120, borderRadius: 2.5, boxShadow: theme.shadows[2] }}>
        <CircularProgress />
      </Card>
    );
  }

  // Local filters (on top of server-side search)
  let filteredData = data;
  if (filterOptions.positive) filteredData = filteredData.filter((p) => p.emotion === 'HAPPY');
  if (filterOptions.negative) filteredData = filteredData.filter((p) => p.emotion === 'ANGRY');
  if (filterOptions.neutral) filteredData = filteredData.filter((p) => p.emotion === 'OTHER');
  if (filterOptions.highEngagement) filteredData = filteredData.filter((p) => (p.likeCount || 0) > 100);
  if (filterOptions.verified) filteredData = filteredData.filter((p) => p.userFollowers > 10000);

  // Sort by engagement (most viewed first)
  const sorted = [...filteredData].sort(
    (a, b) => ((b.viewCount || 0) + (b.likeCount || 0) + (b.retweetCount || 0)) - ((a.viewCount || 0) + (a.likeCount || 0) + (a.retweetCount || 0))
  );

  const displayedPosts = expanded ? sorted : sorted.slice(0, 10);
  const hasActiveSearch = filters?.keyword || filters?.username;
  const activeFiltersCount = Object.values(filterOptions).filter(Boolean).length;

  const handleFilterToggle = (key) => setFilterOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  const handleClearFilters = () => setFilterOptions({ positive: false, negative: false, neutral: false, highEngagement: false, verified: false });

  return (
    <Card sx={{ borderRadius: 2.5, overflow: 'hidden', boxShadow: theme.shadows[2] }}>
      {/* Header — clickable to toggle collapse */}
      <ButtonBase
        component="div"
        onClick={() => setSectionOpen((prev) => !prev)}
        sx={{
          width: '100%', p: 2.5, display: 'block', textAlign: 'start',
          background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.08)} 0%, ${alpha(theme.palette.warning.main, 0.08)} 100%)`,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{ width: 40, height: 40, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.success.main, 0.16) }}>
              <Iconify icon="solar:chat-round-line-bold-duotone" width={24} sx={{ color: theme.palette.success.main }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>پربازدیدترین پست‌ها</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {(total || 0).toLocaleString('fa-IR')} پست
              </Typography>
            </Box>
          </Stack>

          <Iconify
            icon={sectionOpen ? 'solar:alt-arrow-up-bold' : 'solar:alt-arrow-down-bold'}
            width={20}
            sx={{ color: 'text.secondary' }}
          />
        </Stack>
      </ButtonBase>

      {/* Collapsible body */}
      <Collapse in={sectionOpen} timeout={350}>
        <Box sx={{ p: 2.5, pt: 2 }}>
          {/* Timeframe tabs + action buttons */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <ButtonGroup
              variant="outlined"
              size="small"
              sx={{
                '& .MuiButton-root': {
                  fontSize: 9, fontWeight: 600, px: 1.5,
                  borderColor: alpha(theme.palette.primary.main, 0.16),
                  color: 'text.secondary',
                  '&.active': {
                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    fontWeight: 700,
                  },
                },
              }}
            >
              {TIME_FILTERS.map((f) => (
                <Button key={f.value} className={timeFilter === f.value ? 'active' : ''} onClick={(e) => { e.stopPropagation(); onTimeFilterChange(f.value); }}>
                  {f.label}
                </Button>
              ))}
            </ButtonGroup>

            <Stack direction="row" alignItems="center" spacing={0.75}>
              {hasActiveSearch && (
                <IconButton size="small" onClick={onClearSearch} sx={{ bgcolor: alpha(theme.palette.error.main, 0.08) }}>
                  <Iconify icon="solar:close-circle-bold" width={18} sx={{ color: 'error.main' }} />
                </IconButton>
              )}
              <IconButton
                size="small"
                onClick={onSearchOpen}
                sx={{ bgcolor: hasActiveSearch ? alpha(theme.palette.info.main, 0.16) : alpha(theme.palette.grey[500], 0.08) }}
              >
                <Iconify icon="solar:magnifer-bold-duotone" width={18} sx={{ color: hasActiveSearch ? 'info.main' : 'text.secondary' }} />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => setFilterDrawerOpen(true)}
                sx={{ bgcolor: activeFiltersCount > 0 ? alpha(theme.palette.primary.main, 0.16) : alpha(theme.palette.grey[500], 0.08), position: 'relative' }}
              >
                <Iconify icon="solar:filter-bold-duotone" width={18} sx={{ color: activeFiltersCount > 0 ? 'primary.main' : 'text.secondary' }} />
                {activeFiltersCount > 0 && (
                  <Box sx={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main' }} />
                )}
              </IconButton>
            </Stack>
          </Stack>

          {/* Posts */}
          <Stack spacing={1.5}>
            {displayedPosts.map((post) => {
              const eCfg = emotionConfig[post.emotion] || emotionConfig.OTHER;
              return (
                <Card key={post.id} sx={{ p: 2, bgcolor: alpha(theme.palette.grey[500], 0.04), border: `1px solid ${alpha(theme.palette.grey[500], 0.08)}`, borderRadius: 2, '&:hover': { bgcolor: alpha(theme.palette.grey[500], 0.08) } }}>
                  <Stack spacing={1.5}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Avatar sx={{ width: 36, height: 36, bgcolor: theme.palette.primary.main, fontSize: 13, fontWeight: 700 }}>
                        {post.screenName?.charAt(0)?.toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12 }}>
                          @{post.screenName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 10 }}>
                          {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('fa-IR') : ''}
                        </Typography>
                      </Box>
                      <Chip label={eCfg.label} size="small" sx={{ height: 24, fontSize: 10, fontWeight: 700, bgcolor: alpha(eCfg.color, 0.12), color: eCfg.color, border: `1px solid ${alpha(eCfg.color, 0.24)}` }} />
                    </Stack>

                    <Typography variant="caption" sx={{ color: 'text.primary', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: 12 }}>
                      {post.text}
                    </Typography>

                    <Stack direction="row" spacing={2}>
                      {[
                        { icon: 'solar:eye-linear', val: post.viewCount },
                        { icon: 'solar:heart-linear', val: post.likeCount },
                        { icon: 'solar:reorder-linear', val: post.retweetCount },
                      ].map((s) => (
                        <Stack key={s.icon} direction="row" alignItems="center" spacing={0.5}>
                          <Iconify icon={s.icon} width={14} sx={{ color: 'text.disabled' }} />
                          <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 10 }}>{(s.val || 0).toLocaleString('en-US')}</Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Stack>
                </Card>
              );
            })}
          </Stack>

          {!expanded && sorted.length > 10 && (
            <Box sx={{ mt: 2, pt: 2, borderTop: `1px dashed ${alpha(theme.palette.grey[500], 0.2)}`, textAlign: 'center' }}>
              <Button variant="text" size="small" onClick={() => setExpanded(true)} startIcon={<Iconify icon="solar:alt-arrow-down-linear" width={16} />} sx={{ fontSize: 11, fontWeight: 600 }}>
                {sorted.length - 10} پست دیگر
              </Button>
            </Box>
          )}

          {sorted.length === 0 && (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Iconify icon="solar:inbox-line-bold-duotone" width={48} sx={{ color: 'text.disabled', mb: 1 }} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>پستی یافت نشد</Typography>
            </Box>
          )}
        </Box>
      </Collapse>

      {/* Filter Drawer */}
      <FilterDrawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        filterOptions={filterOptions}
        onToggle={handleFilterToggle}
        onClear={handleClearFilters}
      />
    </Card>
  );
}

// ----------------------------------------------------------------------

function FilterDrawer({ open, onClose, filterOptions, onToggle, onClear }) {
  const theme = useTheme();

  const sentimentFilters = [
    { key: 'positive', label: 'مثبت', icon: 'solar:check-circle-bold', color: '#51CF66' },
    { key: 'negative', label: 'منفی', icon: 'solar:danger-triangle-bold', color: '#FF6B6B' },
    { key: 'neutral', label: 'خنثی', icon: 'solar:minus-circle-bold', color: '#ADB5BD' },
  ];

  const engagementFilters = [
    { key: 'highEngagement', label: 'تعامل بالا', subtitle: 'بیش از ۱۰۰ لایک', icon: 'solar:fire-bold', color: theme.palette.warning.main },
    { key: 'verified', label: 'اینفلوئنسر', subtitle: 'بیش از ۱۰K فالوور', icon: 'solar:verified-check-bold', color: theme.palette.info.main },
  ];

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80vh', maxWidth: 430, margin: '0 auto', left: 0, right: 0 } } }}
    >
      <Box sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="solar:filter-bold-duotone" width={24} sx={{ color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>فیلترها</Typography>
          </Stack>
          <IconButton size="small" onClick={onClose}>
            <Iconify icon="solar:close-circle-bold" width={24} />
          </IconButton>
        </Stack>

        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>احساسات</Typography>
            <Stack spacing={1}>
              {sentimentFilters.map((f) => (
                <FilterRow key={f.key} label={f.label} icon={f.icon} color={f.color} checked={filterOptions[f.key]} onChange={() => onToggle(f.key)} />
              ))}
            </Stack>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>تعامل</Typography>
            <Stack spacing={1}>
              {engagementFilters.map((f) => (
                <FilterRow key={f.key} label={f.label} subtitle={f.subtitle} icon={f.icon} color={f.color} checked={filterOptions[f.key]} onChange={() => onToggle(f.key)} />
              ))}
            </Stack>
          </Box>

          <Stack direction="row" spacing={1.5} sx={{ pt: 2 }}>
            <Button fullWidth variant="outlined" onClick={onClear} sx={{ borderRadius: 1.5 }}>حذف همه</Button>
            <Button fullWidth variant="contained" onClick={onClose} sx={{ borderRadius: 1.5 }}>اعمال فیلتر</Button>
          </Stack>
        </Stack>
      </Box>
    </Drawer>
  );
}

// ----------------------------------------------------------------------

function FilterRow({ label, subtitle, icon, color, checked, onChange }) {
  const theme = useTheme();
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ p: 1.5, borderRadius: 1.5, bgcolor: alpha(theme.palette.grey[500], 0.04), border: `1px solid ${alpha(theme.palette.grey[500], 0.08)}` }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Iconify icon={icon} width={20} sx={{ color }} />
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{label}</Typography>
          {subtitle && <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 10 }}>{subtitle}</Typography>}
        </Box>
      </Stack>
      <Switch checked={checked} onChange={onChange} size="small" />
    </Stack>
  );
}
