'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const SENTIMENT_CONFIG = {
  joy: { color: '#51CF66', icon: 'solar:emoji-funny-circle-bold', label: 'شاد' },
  hope: { color: '#339AF0', icon: 'solar:sun-bold', label: 'امیدوار' },
  optimism: { color: '#51CF66', icon: 'solar:star-bold', label: 'خوش‌بین' },
  excitement: { color: '#20C997', icon: 'solar:star-shine-bold', label: 'هیجان' },
  pride: { color: '#845EF7', icon: 'solar:crown-bold', label: 'افتخار' },
  interest: { color: '#74C0FC', icon: 'solar:eye-bold', label: 'علاقه' },
  concern: { color: '#FFA94D', icon: 'solar:shield-warning-bold', label: 'نگرانی' },
  worry: { color: '#FF6B6B', icon: 'solar:danger-triangle-bold', label: 'اضطراب' },
  frustration: { color: '#E03131', icon: 'solar:fire-bold', label: 'خشم' },
  caution: { color: '#FFA94D', icon: 'solar:info-circle-bold', label: 'احتیاط' },
  surprise: { color: '#20C997', icon: 'solar:star-shine-bold', label: 'شگفتی' },
  neutral: { color: '#ADB5BD', icon: 'solar:minus-circle-bold', label: 'خنثی' },
};

const SOURCE_ICONS = {
  twitter: 'ri:twitter-x-fill',
  telegram: 'ic:baseline-telegram',
  instagram: 'mdi:instagram',
  news: 'solar:document-text-bold',
  newspaper: 'solar:document-text-bold',
  forum: 'solar:chat-square-bold',
  tv: 'solar:tv-bold',
  video_media: 'solar:videocamera-record-bold',
};

// Iranian platforms use custom SVG files (mono versions with currentColor)
const CUSTOM_SVG_ICONS = {
  rubika: '/assets/icons/social/rubika-mono.svg',
  bale: '/assets/icons/social/bale-mono.svg',
  eita: '/assets/icons/social/eitaa-mono.svg',
};

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://127.0.0.1:3000';

export function getMediaUrl(url) {
  if (!url) return null;
  if (url.startsWith('/static/')) return `${SERVER_URL}${url}`;
  return url;
}

export function getSentimentConfig(emotion) {
  return SENTIMENT_CONFIG[(emotion || 'neutral').toLowerCase()] || SENTIMENT_CONFIG.neutral;
}

export function getSourceIcon(sourceType) {
  return SOURCE_ICONS[sourceType] || 'solar:global-bold';
}

export function getCustomSvg(sourceType) {
  return CUSTOM_SVG_ICONS[sourceType] || null;
}

// Renders the correct icon for a source type — custom SVG or Iconify
export function SourceIcon({ sourceType, width = 14, sx = {} }) {
  const customSvg = getCustomSvg(sourceType);
  if (customSvg) {
    return (
      <SvgColor
        src={customSvg}
        sx={{ width, height: width, flexShrink: 0, ...sx }}
      />
    );
  }
  const icon = getSourceIcon(sourceType);
  return <Iconify icon={icon} width={width} sx={{ flexShrink: 0, ...sx }} />;
}

export function formatNum(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return (n || 0).toLocaleString('fa-IR');
}

// Normalise different field names from different data shapes
function normalise(post) {
  return {
    id: post.id,
    text: post.text || post.caption || '',
    screenName: post.screenName || post.page?.username || '',
    sourceType: post.sourceType || post.page?.platform || '',
    emotion: post.emotion || post.sentiment_label || 'neutral',
    sentiment: post.sentiment || post.direction || '',
    viewCount: post.viewCount || post.views_count || 0,
    likeCount: post.likeCount || post.likes_count || 0,
    retweetCount: post.retweetCount || post.shares_count || 0,
    replyCount: post.replyCount || post.comments_count || 0,
    userFollowers: post.userFollowers || 0,
    publishedAt: post.publishedAt || post.published_at || '',
    hashtags: post.hashtags || [],
    profileImageUrl: post.profileImageUrl || post.profile_image_url || null,
    mediaUrl: post.mediaUrl || post.media_url || null,
    postType: post.postType || post.post_type || null,
  };
}

// ----------------------------------------------------------------------
// Reusable Post Card
// ----------------------------------------------------------------------

export function PostCard({ post: rawPost, onClick, accentColor, badge, compact }) {
  const theme = useTheme();
  const post = normalise(rawPost);
  const sentConf = getSentimentConfig(post.emotion);
  const mediaUrl = getMediaUrl(post.mediaUrl);
  const isVideo = mediaUrl?.endsWith('.mp4');
  const borderColor = accentColor || alpha(theme.palette.grey[500], 0.08);

  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: 'pointer', overflow: 'hidden',
        border: `1px solid ${typeof accentColor === 'string' ? alpha(accentColor, 0.16) : alpha(theme.palette.grey[500], 0.08)}`,
        borderRight: accentColor ? `4px solid ${accentColor}` : undefined,
        borderRadius: 2,
        transition: 'all 0.15s',
        '&:active': { transform: 'scale(0.98)' },
      }}
    >
      {/* Media */}
      {mediaUrl && !compact && (
        <Box sx={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden', bgcolor: 'grey.100' }}>
          {isVideo ? (
            <Box component="video" src={mediaUrl} muted preload="metadata"
              sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <Box component="img" src={mediaUrl}
              onError={(e) => { e.target.parentElement.style.display = 'none'; }}
              sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          )}
          {post.postType && (
            <Chip label={post.postType} size="small"
              sx={{ position: 'absolute', top: 8, left: 8, height: 20, fontSize: 9, bgcolor: 'rgba(0,0,0,0.6)', color: '#fff', '& .MuiChip-label': { px: 0.75 } }}
            />
          )}
          {isVideo && (
            <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Iconify icon="solar:play-bold" width={20} sx={{ color: '#fff', ml: 0.25 }} />
              </Box>
            </Box>
          )}
        </Box>
      )}

      <Box sx={{ p: 1.5 }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <Avatar src={getMediaUrl(post.profileImageUrl)} sx={{ width: 28, height: 28, bgcolor: alpha(sentConf.color, 0.16), color: sentConf.color, fontSize: 11, fontWeight: 700 }}>
            {post.screenName?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 11 }} noWrap>@{post.screenName}</Typography>
            <Typography variant="caption" color="text.disabled" sx={{ display: 'block', fontSize: 9 }}>
              {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('fa-IR') : ''}
            </Typography>
          </Box>
          {badge || <SourceIcon sourceType={post.sourceType} width={14} sx={{ color: 'text.disabled' }} />}
        </Stack>

        {/* Text */}
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: 11, lineHeight: 1.7, mb: 1, display: '-webkit-box', WebkitLineClamp: compact ? 2 : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {post.text || '—'}
        </Typography>

        {/* Tags + engagement */}
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Chip label={sentConf.label} size="small" icon={<Iconify icon={sentConf.icon} width={10} />}
            sx={{ height: 20, fontSize: 8, fontWeight: 700, bgcolor: alpha(sentConf.color, 0.12), color: sentConf.color, '& .MuiChip-icon': { color: sentConf.color } }}
          />
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Stack direction="row" alignItems="center" spacing={0.25}>
              <Iconify icon="solar:eye-linear" width={12} sx={{ color: 'text.disabled' }} />
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9 }}>{formatNum(post.viewCount)}</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.25}>
              <Iconify icon="solar:heart-linear" width={12} sx={{ color: 'text.disabled' }} />
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9 }}>{formatNum(post.likeCount)}</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.25}>
              <Iconify icon="solar:share-linear" width={12} sx={{ color: 'text.disabled' }} />
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9 }}>{formatNum(post.retweetCount)}</Typography>
            </Stack>
          </Stack>
        </Stack>
      </Box>
    </Card>
  );
}

// ----------------------------------------------------------------------
// Reusable Post Detail Bottom Sheet
// ----------------------------------------------------------------------

export function PostDetailDrawer({ post: rawPost, onClose }) {
  const theme = useTheme();

  if (!rawPost) return null;

  const post = normalise(rawPost);
  const sentConf = getSentimentConfig(post.emotion);
  const mediaUrl = getMediaUrl(post.mediaUrl);
  const isVideo = mediaUrl?.endsWith('.mp4');

  return (
    <Drawer
      anchor="bottom"
      open
      onClose={onClose}
      slotProps={{ paper: { sx: { borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '92vh' } } }}
    >
      {/* Drag handle */}
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1.5, pb: 1 }}>
        <Box sx={{ width: 36, height: 4, borderRadius: 2, bgcolor: alpha(theme.palette.grey[500], 0.3) }} />
      </Box>

      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2.5, pb: 1.5 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Avatar src={getMediaUrl(post.profileImageUrl)} sx={{ width: 36, height: 36, bgcolor: alpha(sentConf.color, 0.16), color: sentConf.color, fontSize: 14, fontWeight: 700 }}>
            {post.screenName?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>@{post.screenName}</Typography>
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <SourceIcon sourceType={post.sourceType} width={13} sx={{ color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('fa-IR') : ''}
              </Typography>
            </Stack>
          </Box>
        </Stack>
        <IconButton size="small" onClick={onClose}>
          <Iconify icon="solar:close-circle-bold" width={22} />
        </IconButton>
      </Stack>

      {/* Scrollable content */}
      <Box sx={{ overflow: 'auto', px: 2.5, pb: 3 }}>
        {mediaUrl && (
          isVideo ? (
            <Box component="video" src={mediaUrl} controls playsInline
              sx={{ width: '100%', maxHeight: 300, borderRadius: 2, mb: 2, bgcolor: 'black' }}
            />
          ) : (
            <Box component="img" src={mediaUrl}
              onError={(e) => { e.target.style.display = 'none'; }}
              sx={{ width: '100%', maxHeight: 300, objectFit: 'contain', borderRadius: 2, mb: 2 }}
            />
          )
        )}

        <Typography variant="body2" sx={{ lineHeight: 2, mb: 2, fontSize: 13 }}>
          {post.text || 'بدون متن'}
        </Typography>

        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
          <Chip label={sentConf.label} size="small" icon={<Iconify icon={sentConf.icon} width={12} />}
            sx={{ bgcolor: alpha(sentConf.color, 0.12), color: sentConf.color, '& .MuiChip-icon': { color: sentConf.color } }}
          />
          <Chip label={`❤️ ${formatNum(post.likeCount)}`} size="small" />
          <Chip label={`👁 ${formatNum(post.viewCount)}`} size="small" />
          <Chip label={`🔄 ${formatNum(post.retweetCount)}`} size="small" />
        </Stack>

        {post.hashtags?.length > 0 && (
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
            {post.hashtags.map((tag) => (
              <Chip key={tag} label={`#${tag}`} size="small" variant="outlined" sx={{ height: 22, fontSize: 10 }} />
            ))}
          </Stack>
        )}

        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.grey[500], 0.04), border: `1px solid ${alpha(theme.palette.grey[500], 0.08)}` }}>
          <Stack direction="row" spacing={3}>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 9, display: 'block' }}>دنبال‌کننده</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{formatNum(post.userFollowers)}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 9, display: 'block' }}>منبع</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{post.sourceType}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 9, display: 'block' }}>احساس</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: sentConf.color }}>{sentConf.label}</Typography>
            </Box>
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
}

// ----------------------------------------------------------------------
// Hook: manages selected post state + renders drawer
// Usage: const { openPost, PostDrawer } = usePostDrawer();
// Then: <PostCard onClick={() => openPost(post)} /> and {PostDrawer}
// ----------------------------------------------------------------------

export function usePostDrawer() {
  const [selected, setSelected] = useState(null);

  const PostDrawerEl = selected ? (
    <PostDetailDrawer post={selected} onClose={() => setSelected(null)} />
  ) : null;

  return {
    openPost: setSelected,
    PostDrawer: PostDrawerEl,
  };
}
