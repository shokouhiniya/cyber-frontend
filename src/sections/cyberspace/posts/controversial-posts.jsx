import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import ButtonGroup from '@mui/material/ButtonGroup';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const POSITIVE_COLOR = '#51CF66';
const NEGATIVE_COLOR = '#FF6B6B';

const POSITIVE_EMOTIONS = ['joy', 'hope', 'optimism', 'excitement', 'pride', 'interest', 'surprise', 'happy'];
const NEGATIVE_EMOTIONS = ['concern', 'worry', 'frustration', 'caution', 'fear', 'anger', 'angry', 'sad', 'hate'];

const TIME_FILTERS = [
  { value: '24h', label: '۲۴ ساعت' },
  { value: '7d', label: 'هفته پیش' },
  { value: '30d', label: 'ماه پیش' },
  { value: 'all', label: 'کل بازه' },
];

function classifyPost(post) {
  const emotion = (post.emotion || '').toLowerCase();
  if (POSITIVE_EMOTIONS.includes(emotion)) return 'positive';
  if (NEGATIVE_EMOTIONS.includes(emotion)) return 'negative';
  if (post.sentiment === 'positive') return 'positive';
  if (post.sentiment === 'negative') return 'negative';
  return 'neutral';
}

function filterByTime(posts, tf) {
  if (tf === 'all') return posts;
  const ms = { '24h': 24 * 3600000, '7d': 7 * 86400000, '30d': 30 * 86400000 }[tf];
  if (!ms) return posts;
  const cutoff = Date.now() - ms;
  return posts.filter((p) => p.publishedAt && new Date(p.publishedAt).getTime() >= cutoff);
}

const formatNum = (n) => {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return (n || 0).toLocaleString('fa-IR');
};

export function ControversialPosts({ data, loading }) {
  const theme = useTheme();
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
    .map((post) => {
      const direction = classifyPost(post);
      const engagement = (post.viewCount || 0) + (post.likeCount || 0) * 5 + (post.retweetCount || 0) * 10;
      const impact = direction === 'neutral' ? 0 : engagement;
      return { ...post, impact, direction };
    })
    .filter((p) => p.direction !== 'neutral')
    .sort((a, b) => b.impact - a.impact);

  const displayedPosts = expanded ? scored : scored.slice(0, 8);

  return (
    <Card sx={{ borderRadius: 2.5, overflow: 'hidden', boxShadow: theme.shadows[2] }}>
      {/* Header */}
      <ButtonBase
        component="div"
        onClick={() => setSectionOpen((prev) => !prev)}
        sx={{
          width: '100%', p: 2.5, display: 'block', textAlign: 'start',
          background: `linear-gradient(135deg, ${alpha(NEGATIVE_COLOR, 0.08)} 0%, ${alpha(POSITIVE_COLOR, 0.08)} 100%)`,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{ width: 40, height: 40, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.error.main, 0.16) }}>
              <Iconify icon="solar:fire-bold-duotone" width={24} sx={{ color: theme.palette.error.main }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>پربحث‌ترین پست‌ها</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                پست‌هایی با بیشترین تأثیر بر احساسات کلی
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
          {/* Timeframe tabs */}
          <ButtonGroup
            variant="outlined"
            size="small"
            sx={{
              mb: 2,
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
              <Button
                key={f.value}
                className={timeFilter === f.value ? 'active' : ''}
                onClick={(e) => { e.stopPropagation(); setTimeFilter(f.value); }}
              >
                {f.label}
              </Button>
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
                {displayedPosts.map((post, index) => {
                  const isPositive = post.direction === 'positive';
                  const accentColor = isPositive ? POSITIVE_COLOR : NEGATIVE_COLOR;

                  return (
                    <Card
                      key={post.id}
                      sx={{
                        p: 2,
                        bgcolor: alpha(accentColor, 0.03),
                        border: `1px solid ${alpha(accentColor, 0.16)}`,
                        borderRight: `4px solid ${accentColor}`,
                        borderRadius: 2,
                        transition: 'all 0.2s ease',
                        '&:hover': { bgcolor: alpha(accentColor, 0.06) },
                      }}
                    >
                      <Stack spacing={1.5}>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Avatar sx={{ width: 36, height: 36, bgcolor: alpha(accentColor, 0.16), color: accentColor, fontSize: 13, fontWeight: 700 }}>
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
                          <Stack direction="row" alignItems="center" spacing={0.75}>
                            <Chip
                              icon={<Iconify icon={isPositive ? 'solar:arrow-up-bold' : 'solar:arrow-down-bold'} width={12} />}
                              label={isPositive ? 'مثبت' : 'منفی'}
                              size="small"
                              sx={{
                                height: 24, fontSize: 10, fontWeight: 700,
                                bgcolor: alpha(accentColor, 0.12),
                                color: accentColor,
                                border: `1px solid ${alpha(accentColor, 0.24)}`,
                                '& .MuiChip-icon': { color: accentColor },
                              }}
                            />
                            <Typography variant="caption" sx={{ fontWeight: 800, fontSize: 10, color: accentColor }}>
                              #{index + 1}
                            </Typography>
                          </Stack>
                        </Stack>

                        <Typography variant="caption" sx={{ color: 'text.primary', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: 12 }}>
                          {post.text}
                        </Typography>

                        <Stack direction="row" spacing={2}>
                          {[
                            { icon: 'solar:eye-linear', val: post.viewCount },
                            { icon: 'solar:heart-linear', val: post.likeCount },
                            { icon: 'solar:share-linear', val: post.retweetCount },
                          ].map((s) => (
                            <Stack key={s.icon} direction="row" alignItems="center" spacing={0.5}>
                              <Iconify icon={s.icon} width={14} sx={{ color: alpha(accentColor, 0.6) }} />
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 10, fontWeight: 600 }}>
                                {formatNum(s.val)}
                              </Typography>
                            </Stack>
                          ))}
                        </Stack>
                      </Stack>
                    </Card>
                  );
                })}
              </Stack>

              {!expanded && scored.length > 8 && (
                <Box sx={{ mt: 2, pt: 2, borderTop: `1px dashed ${alpha(theme.palette.grey[500], 0.2)}`, textAlign: 'center' }}>
                  <Button variant="text" size="small" onClick={() => setExpanded(true)} startIcon={<Iconify icon="solar:alt-arrow-down-linear" width={16} />} sx={{ fontSize: 11, fontWeight: 600 }}>
                    {scored.length - 8} پست دیگر
                  </Button>
                </Box>
              )}
            </>
          )}
        </Box>
      </Collapse>
    </Card>
  );
}
