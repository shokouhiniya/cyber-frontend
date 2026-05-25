'use client';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { alpha, useTheme } from '@mui/material/styles';

import { useProfile } from 'src/api/dashboard';

import { Iconify } from 'src/components/iconify';
import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const SENTIMENT_CONFIG = {
  // Emotion labels (from our own NLP pipeline)
  joy:         { color: '#51CF66', icon: 'solar:emoji-funny-circle-bold', label: 'شاد' },
  hope:        { color: '#339AF0', icon: 'solar:sun-bold',                label: 'امیدوار' },
  optimism:    { color: '#51CF66', icon: 'solar:star-bold',               label: 'خوش‌بین' },
  excitement:  { color: '#20C997', icon: 'solar:star-shine-bold',         label: 'هیجان' },
  pride:       { color: '#845EF7', icon: 'solar:crown-bold',              label: 'افتخار' },
  interest:    { color: '#74C0FC', icon: 'solar:eye-bold',                label: 'علاقه' },
  concern:     { color: '#FFA94D', icon: 'solar:shield-warning-bold',     label: 'نگرانی' },
  worry:       { color: '#FF6B6B', icon: 'solar:danger-triangle-bold',    label: 'اضطراب' },
  frustration: { color: '#E03131', icon: 'solar:fire-bold',               label: 'خشم' },
  caution:     { color: '#FFA94D', icon: 'solar:info-circle-bold',        label: 'احتیاط' },
  surprise:    { color: '#20C997', icon: 'solar:star-shine-bold',         label: 'شگفتی' },
  neutral:     { color: '#ADB5BD', icon: 'solar:minus-circle-bold',       label: 'خنثی' },
  // Sentiment labels (from 8tag and other sources)
  positive:    { color: '#51CF66', icon: 'solar:like-bold',               label: 'مثبت' },
  negative:    { color: '#FF6B6B', icon: 'solar:dislike-bold',            label: 'منفی' },
};

const SOURCE_ICONS = {
  twitter:   'ri:twitter-x-fill',
  telegram:  'ic:baseline-telegram',
  instagram: 'mdi:instagram',
  news:      'solar:document-text-bold',
  newspaper: 'solar:document-text-bold',
  forum:     'solar:chat-square-bold',
  tv:        'solar:tv-bold',
  video_media: 'solar:videocamera-record-bold',
  aparat:    'solar:videocamera-record-bold-duotone',
  youtube:   'mdi:youtube',
  media:     'solar:tv-bold-duotone',
};

const SOURCE_LABELS = {
  telegram:  'تلگرام',
  bale:      'بله',
  rubika:    'روبیکا',
  eitaa:     'ایتا',
  twitter:   'ایکس',
  instagram: 'اینستاگرام',
  news:      'خبرگزاری',
  newspaper: 'روزنامه',
  media:     'رسانه تصویری',
  forum:     'فروم',
  aparat:    'آپارات',
};

export function getSourceLabel(post) {
  // post can be a string (sourceType) or a full post object
  const sourceType = typeof post === 'string' ? post : post?.sourceType;
  const platform   = typeof post === 'object'  ? post?.platform : null;
  if (sourceType === 'aparat' && platform === 'youtube') return 'یوتیوب';
  return SOURCE_LABELS[sourceType] || sourceType;
}

// Iranian platforms use custom SVG files (mono versions with currentColor)
const CUSTOM_SVG_ICONS = {
  rubika: '/assets/icons/social/rubika-mono.svg',
  bale:   '/assets/icons/social/bale-mono.svg',
  eitaa:  '/assets/icons/social/eitaa-mono.svg',
  eita:   '/assets/icons/social/eitaa-mono.svg', // alias
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

export function getSourceIcon(sourceType, platform) {
  if (sourceType === 'aparat' && platform === 'youtube') return SOURCE_ICONS.youtube;
  return SOURCE_ICONS[sourceType] || 'solar:global-bold';
}

export function getCustomSvg(sourceType) {
  return CUSTOM_SVG_ICONS[sourceType] || null;
}

// Renders the correct icon for a source type — custom SVG or Iconify
export function SourceIcon({ sourceType, platform, width = 14, sx = {} }) {
  const customSvg = getCustomSvg(sourceType);
  if (customSvg) {
    return (
      <SvgColor
        src={customSvg}
        sx={{ width, height: width, flexShrink: 0, ...sx }}
      />
    );
  }
  const icon = getSourceIcon(sourceType, platform);
  return <Iconify icon={icon} width={width} sx={{ flexShrink: 0, ...sx }} />;
}

export function formatNum(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return (n || 0).toLocaleString('fa-IR');
}

/**
 * Splits text into segments, wrapping keyword matches in a highlight span.
 * keywords: array of strings (pipe-separated terms from the `or` field).
 * Returns an array of { text, highlight } objects.
 */
/**
 * Normalises Persian/Arabic text for fuzzy matching:
 *   - strips Arabic diacritics (harakat): U+064B–U+065F
 *   - strips zero-width non-joiner (half-space) U+200C and zero-width joiner U+200D
 *   - strips Arabic tatweel (kashida) U+0640
 *   - normalises Arabic ye (ي U+064A) → Persian ye (ی U+06CC)
 *   - normalises Arabic kaf (ك U+0643) → Persian kaf (ک U+06A9)
 * Mirrors 8tag's own matching rules so highlighted spans align with API matches.
 */
// Characters that 8tag ignores when matching keywords:
// harakat (U+064B-U+065F), kashida (U+0640), ZWNJ (U+200C), ZWJ (U+200D), whitespace.
// We build a regex that allows these between every character of the keyword,
// so جَنتی matches جنتی, احمد‌جنتی matches احمد جنتی, etc.
const NOISE_PATTERN = '[\u064B-\u065F\u0640\u200C\u200D\\s]*';

// Normalise a keyword: Arabic ye → Persian ye, Arabic kaf → Persian kaf.
function normaliseKeyword(k) {
  if (!k) return '';
  return k
    .replace(/\u064A/g, '\u06CC')
    .replace(/\u0643/g, '\u06A9');
}

// Build a regex pattern for a keyword that tolerates noise chars between letters
// and also matches Arabic/Persian letter variants (ي↔ی, ك↔ک).
function keywordToPattern(keyword) {
  const norm = normaliseKeyword(keyword);
  const chars = Array.from(norm).map((ch) => {
    const esc = ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Allow Arabic/Persian letter variants in the source text
    if (ch === '\u06CC') return '[\u06CC\u064A]';  // ی or ي
    if (ch === '\u06A9') return '[\u06A9\u0643]';  // ک or ك
    // A space in the keyword should match space OR ZWNJ (half-space) in text
    if (ch === ' ') return '[\u200C\u200D\\s]+';
    return esc;
  });
  return chars.join(NOISE_PATTERN);
}

function buildSegments(text, keywords) {
  if (!text || !keywords || keywords.length === 0) return [{ text, highlight: false }];

  const patterns = keywords
    .filter(Boolean)
    .map(keywordToPattern)
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);

  if (patterns.length === 0) return [{ text, highlight: false }];

  const pattern = new RegExp('(' + patterns.join('|') + ')', 'gi');

  const segments = [];
  let cursor = 0;
  let m;
  pattern.lastIndex = 0;
  while ((m = pattern.exec(text)) !== null) {
    if (m.index > cursor) {
      segments.push({ text: text.slice(cursor, m.index), highlight: false });
    }
    segments.push({ text: m[0], highlight: true });
    cursor = m.index + m[0].length;
    if (m[0].length === 0) { pattern.lastIndex++; }
  }
  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), highlight: false });
  }

  return segments.length > 0 ? segments : [{ text, highlight: false }];
}

/**
 * Renders text with keyword highlights.
 * Accepts the same sx as Typography.
 */
export const HighlightedText = React.forwardRef(function HighlightedText({ text, keywords, sx, component = 'span' }, ref) {
  const theme = useTheme();
  if (!keywords || keywords.length === 0) {
    return <Box ref={ref} component={component} sx={sx}>{text}</Box>;
  }

  const segments = buildSegments(text, keywords);

  return (
    <Box ref={ref} component={component} sx={sx}>
      {segments.map((seg, i) =>
        seg.highlight ? (
          <Box
            key={i}
            component="mark"
            sx={{
              bgcolor: alpha(theme.palette.warning.main, 0.25),
              color: 'inherit',
              borderRadius: 0.5,
              px: 0.25,
              fontWeight: 700,
            }}
          >
            {seg.text}
          </Box>
        ) : (
          seg.text
        )
      )}
    </Box>
  );
});

/**
 * Formats a date string as Jalali date + time in GMT+3:30 (Iran Standard Time).
 * e.g. "۱۴۰۵/۰۲/۲۱  ۱۳:۴۵"
 */
export function formatDateTime(dateStr) {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    const datePart = date.toLocaleDateString('fa-IR', { timeZone: 'Asia/Tehran' });
    const timePart = date.toLocaleTimeString('fa-IR', {
      timeZone: 'Asia/Tehran',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return `${datePart}  ${timePart}`;
  } catch {
    return dateStr;
  }
}

// Normalise different field names from different data shapes
function normalise(post) {
  // emotion (our NLP: joy/hope/...) takes priority; sentiment (positive/negative/neutral)
  // is the fallback — both are valid keys in SENTIMENT_CONFIG.
  const emotionKey = (post.emotion || post.sentiment_label || '').toLowerCase();
  const sentimentKey = (post.sentiment || post.direction || '').toLowerCase();
  const displayEmotion = emotionKey || sentimentKey || 'neutral';

  // screenName may arrive as an object from some sources (e.g. news publisher object)
  const rawScreenName = post.screenName || post.page?.username || '';
  const screenName = typeof rawScreenName === 'string'
    ? rawScreenName
    : rawScreenName?.title || rawScreenName?.name || rawScreenName?.domain || '';

  return {
    id: post.id,
    text: post.text || post.caption || '',
    title: post.title || null,
    fullText: post.fullText || null,
    articleUrl: post.articleUrl || null,
    topic: post.topic || null,
    screenName,
    displayName: post.displayName || null,
    sourceType: post.sourceType || post.page?.platform || '',
    emotion: displayEmotion,
    viewCount: post.viewCount || post.views_count || 0,
    likeCount: post.likeCount || post.likes_count || 0,
    retweetCount: post.retweetCount || post.shares_count || 0,
    replyCount: post.replyCount || post.comments_count || 0,
    quoteCount: post.quoteCount || 0,
    bookmarkCount: post.bookmarkCount || 0,
    userFollowers: post.userFollowers || 0,
    publisherRank: post.publisherRank ?? null,
    publishedAt: post.publishedAt || post.published_at || '',
    hashtags: post.hashtags || [],
    profileImageUrl: post.profileImageUrl || post.profile_image_url || null,
    mediaUrl: post.mediaUrl || post.media_url || null,
    postType: post.postType || post.post_type || null,
    retweetUser: post.retweetUser || null,
    // 8tag-specific
    reactions: post.reactions || null,
    hasMedia: post.hasMedia || false,
    postUrl: post.postUrl || null,
    duration: post.duration || null,
    highlights: post.highlights || [],  // keywords to highlight
    // newspaper-specific
    pageNum: post.pageNum || null,
    jdate: post.jdate || null,
    // video-specific
    platform: post.platform || null,
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
      {(mediaUrl || post.hasMedia) && !compact && (
        <Box sx={{ position: 'relative', width: '100%', overflow: 'hidden', bgcolor: 'grey.100' }}>
          {mediaUrl ? (
            <>
              <Box sx={{ aspectRatio: '16/9' }}>
                {isVideo ? (
                  <Box component="video" src={mediaUrl} muted preload="metadata"
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <Box component="img" src={mediaUrl}
                    onError={(e) => { e.target.parentElement.parentElement.style.display = 'none'; }}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                )}
              </Box>
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
            </>
          ) : post.hasMedia ? (
            // Post has media but API doesn't serve the URL
            <Box sx={{ height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, bgcolor: (t) => t.palette.grey[100] }}>
              <Iconify
                icon={post.postType === 'video' ? 'solar:videocamera-record-bold-duotone' : 'solar:gallery-bold-duotone'}
                width={20}
                sx={{ color: 'text.disabled' }}
              />
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
                {post.postType === 'video' ? 'ویدیو' : 'تصویر'} — پیش‌نمایش در دسترس نیست
              </Typography>
            </Box>
          ) : null}
        </Box>
      )}

      <Box sx={{ p: 1.5 }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <Avatar src={getMediaUrl(post.profileImageUrl)} sx={{ width: 28, height: 28, bgcolor: alpha(sentConf.color, 0.16), color: sentConf.color, fontSize: 11, fontWeight: 700 }}>
            {post.screenName?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 11 }} noWrap>
              {post.sourceType === 'twitter' && post.displayName
                ? post.displayName
                : ['news', 'newspaper'].includes(post.sourceType)
                ? post.screenName
                : `@${post.screenName}`}
            </Typography>
            <Typography variant="caption" color="text.disabled" sx={{ display: 'block', fontSize: 9 }}>
              {post.sourceType === 'twitter' && post.screenName && post.displayName
                ? `@${post.screenName} · ${formatDateTime(post.publishedAt)}`
                : formatDateTime(post.publishedAt)}
            </Typography>
          </Box>
          {badge || <SourceIcon sourceType={post.sourceType} platform={post.platform} width={14} sx={{ color: 'text.disabled' }} />}
        </Stack>

        {/* Retweet attribution */}
        {post.postType === 'retweet' && post.retweetUser && (
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9, mb: 0.5, display: 'block' }}>
            🔄 بازتوییت از @{post.retweetUser}
          </Typography>
        )}

        {/* Title — shown for news/article posts */}
        {post.title && (
          <HighlightedText
            text={post.title}
            keywords={post.highlights}
            component="div"
            sx={{ fontWeight: 700, fontSize: 12, mb: 0.5, lineHeight: 1.5 }}
          />
        )}

        {/* Text — clamped to 3 lines on the card */}
        <HighlightedText
          text={post.text || '—'}
          keywords={post.highlights}
          component="div"
          sx={{
            fontSize: 11, lineHeight: 1.7, mb: 1, color: 'text.secondary',
            display: '-webkit-box', WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
            whiteSpace: 'pre-line',
          }}
        />

        {/* Emoji reactions (telegram/messaging) */}
        {post.reactions && post.reactions.length > 0 && (
          <Stack direction="row" spacing={0.5} sx={{ mb: 1, flexWrap: 'wrap' }}>
            {post.reactions.slice(0, 5).map((r, i) => (
              <Box
                key={i}
                sx={{
                  display: 'inline-flex', alignItems: 'center', gap: 0.25,
                  px: 0.75, py: 0.25, borderRadius: 1,
                  bgcolor: (t) => t.palette.grey[100],
                  fontSize: 11,
                }}
              >
                <span>{r.reaction}</span>
                <Typography component="span" sx={{ fontSize: 9, color: 'text.secondary', fontWeight: 600 }}>
                  {formatNum(r.count)}
                </Typography>
              </Box>
            ))}
          </Stack>
        )}

        {/* Stats row — icons and labels adapt to source type */}
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Chip label={sentConf.label} size="small" icon={<Iconify icon={sentConf.icon} width={10} />}
            sx={{ height: 20, fontSize: 8, fontWeight: 700, bgcolor: alpha(sentConf.color, 0.12), color: sentConf.color, '& .MuiChip-icon': { color: sentConf.color } }}
          />
          <Stack direction="row" alignItems="center" spacing={1}>
            {/* Views */}
            {post.viewCount > 0 && (
              <Stack direction="row" alignItems="center" spacing={0.25}>
                <Iconify icon="solar:eye-linear" width={12} sx={{ color: 'text.disabled' }} />
                <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9 }}>{formatNum(post.viewCount)}</Typography>
              </Stack>
            )}
            {/* Likes */}
            {post.likeCount > 0 && !['telegram','bale','rubika','eitaa'].includes(post.sourceType) && (
              <Stack direction="row" alignItems="center" spacing={0.25}>
                <Iconify icon="solar:heart-linear" width={12} sx={{ color: 'text.disabled' }} />
                <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9 }}>{formatNum(post.likeCount)}</Typography>
              </Stack>
            )}
            {/* Retweets / Forwards */}
            {post.retweetCount > 0 && (
              <Stack direction="row" alignItems="center" spacing={0.25}>
                <Iconify icon="solar:forward-linear" width={12} sx={{ color: 'text.disabled' }} />
                <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9 }}>{formatNum(post.retweetCount)}</Typography>
              </Stack>
            )}
            {/* Quotes (X only) */}
            {post.quoteCount > 0 && (
              <Stack direction="row" alignItems="center" spacing={0.25}>
                <Iconify icon="solar:chat-square-linear" width={12} sx={{ color: 'text.disabled' }} />
                <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9 }}>{formatNum(post.quoteCount)}</Typography>
              </Stack>
            )}
            {/* Comments */}
            {post.replyCount > 0 && (
              <Stack direction="row" alignItems="center" spacing={0.25}>
                <Iconify icon="solar:chat-line-linear" width={12} sx={{ color: 'text.disabled' }} />
                <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9 }}>{formatNum(post.replyCount)}</Typography>
              </Stack>
            )}
            {/* Bookmarks (X only) */}
            {post.bookmarkCount > 0 && (
              <Stack direction="row" alignItems="center" spacing={0.25}>
                <Iconify icon="solar:bookmark-linear" width={12} sx={{ color: 'text.disabled' }} />
                <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9 }}>{formatNum(post.bookmarkCount)}</Typography>
              </Stack>
            )}
          </Stack>
        </Stack>
      </Box>
    </Card>
  );
}

// ----------------------------------------------------------------------
// Reusable Post Detail Bottom Sheet
// ----------------------------------------------------------------------
// DrawerText — shows text in the drawer, collapsed beyond ~10 lines
// Uses character count as a proxy (≈ 400 chars ≈ 10 lines at drawer width)
// ----------------------------------------------------------------------

const DRAWER_CHAR_LIMIT = 400;

function DrawerText({ text, keywords }) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const isLong = text && text.length > DRAWER_CHAR_LIMIT;
  const displayed = isLong && !expanded ? text.slice(0, DRAWER_CHAR_LIMIT) + '…' : text;

  return (
    <Box sx={{ mb: 2 }}>
      <HighlightedText
        text={displayed || 'بدون متن'}
        keywords={keywords}
        component="div"
        sx={{ lineHeight: 2, fontSize: 13, whiteSpace: 'pre-line' }}
      />
      {isLong && (
        <Box
          onClick={() => setExpanded((p) => !p)}
          sx={{
            display: 'inline-flex', alignItems: 'center', gap: 0.5,
            mt: 0.5, cursor: 'pointer',
            color: 'primary.main', fontSize: 12, fontWeight: 700,
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          <Iconify
            icon={expanded ? 'solar:alt-arrow-up-bold' : 'solar:alt-arrow-down-bold'}
            width={14}
          />
          {expanded ? 'نمایش کمتر' : 'نمایش کامل متن'}
        </Box>
      )}
    </Box>
  );
}

// ----------------------------------------------------------------------

export function PostDetailDrawer({ post: rawPost, onClose }) {
  const theme = useTheme();
  const [fullTextOpen, setFullTextOpen] = useState(false);

  if (!rawPost) return null;

  const post = normalise(rawPost);
  const sentConf = getSentimentConfig(post.emotion);
  const mediaUrl = getMediaUrl(post.mediaUrl);
  const isVideo = mediaUrl?.endsWith('.mp4');
  const isNews = ['news', 'newspaper'].includes(post.sourceType);

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
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {isNews ? post.screenName
                : post.sourceType === 'twitter' && post.displayName ? post.displayName
                : ['news', 'newspaper'].includes(post.sourceType) ? post.screenName
                : `@${post.screenName}`}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <SourceIcon sourceType={post.sourceType} platform={post.platform} width={13} sx={{ color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                {post.sourceType === 'twitter' && post.screenName && post.displayName
                  ? `@${post.screenName} · ${formatDateTime(post.publishedAt)}`
                  : formatDateTime(post.publishedAt)}
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

        {/* Title for news */}
        {post.title && (
          <HighlightedText
            text={post.title}
            keywords={post.highlights}
            component="div"
            sx={{ fontWeight: 700, mb: 1.5, lineHeight: 1.6, fontSize: 16 }}
          />
        )}

        {/* Abstract / main text — clamped to 10 lines with expand toggle */}
        <DrawerText text={post.text || 'بدون متن'} keywords={post.highlights} />

        {/* Collapsible video description — aparat/youtube */}
        {post.sourceType === 'aparat' && post.fullText && (
          <Box sx={{ mb: 2 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setFullTextOpen((p) => !p)}
              startIcon={<Iconify icon={fullTextOpen ? 'solar:alt-arrow-up-bold' : 'solar:alt-arrow-down-bold'} width={16} />}
              sx={{ mb: 1, fontSize: 11 }}
            >
              {fullTextOpen ? 'بستن توضیحات' : 'مشاهده توضیحات ویدیو'}
            </Button>
            <Collapse in={fullTextOpen}>
              <Box
                sx={{
                  p: 2, borderRadius: 2,
                  bgcolor: alpha(theme.palette.grey[500], 0.04),
                  border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
                  maxHeight: 400, overflow: 'auto',
                }}
              >
                <HighlightedText
                  text={post.fullText}
                  keywords={post.highlights}
                  component="div"
                  sx={{ lineHeight: 2, fontSize: 12, whiteSpace: 'pre-line', color: 'text.secondary' }}
                />
              </Box>
            </Collapse>
          </Box>
        )}

        {/* Collapsible full article — news only */}
        {isNews && post.fullText && post.fullText !== post.text && (
          <Box sx={{ mb: 2 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setFullTextOpen((p) => !p)}
              startIcon={<Iconify icon={fullTextOpen ? 'solar:alt-arrow-up-bold' : 'solar:alt-arrow-down-bold'} width={16} />}
              sx={{ mb: 1, fontSize: 11 }}
            >
              {fullTextOpen ? 'بستن متن کامل' : 'مشاهده متن کامل خبر'}
            </Button>
            <Collapse in={fullTextOpen}>
              <Box
                sx={{
                  p: 2, borderRadius: 2,
                  bgcolor: alpha(theme.palette.grey[500], 0.04),
                  border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
                  maxHeight: 400, overflow: 'auto',
                }}
              >
                <Typography variant="body2" sx={{ lineHeight: 2, fontSize: 12, whiteSpace: 'pre-line', color: 'text.secondary' }}>
                  {post.fullText}
                </Typography>
              </Box>
            </Collapse>
          </Box>
        )}

        {/* Article link */}
        {post.articleUrl && (
          <Box sx={{ mb: 2 }}>
            <Link href={post.articleUrl} target="_blank" rel="noopener noreferrer" variant="caption" sx={{ fontSize: 11 }}>
              مشاهده خبر در منبع اصلی ↗
            </Link>
          </Box>
        )}

        {/* Emoji reactions */}
        {post.reactions && post.reactions.length > 0 && (
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
            {post.reactions.map((r, i) => (
              <Box
                key={i}
                sx={{
                  display: 'inline-flex', alignItems: 'center', gap: 0.5,
                  px: 1, py: 0.5, borderRadius: 1.5,
                  bgcolor: (t) => t.palette.grey[100],
                  fontSize: 14,
                }}
              >
                <span>{r.reaction}</span>
                <Typography component="span" sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 700 }}>
                  {formatNum(r.count)}
                </Typography>
              </Box>
            ))}
          </Stack>
        )}

        {/* Sentiment + engagement chips */}
        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
          <Chip label={sentConf.label} size="small" icon={<Iconify icon={sentConf.icon} width={12} />}
            sx={{ bgcolor: alpha(sentConf.color, 0.12), color: sentConf.color, '& .MuiChip-icon': { color: sentConf.color } }}
          />
          {post.viewCount > 0 && <Chip label={`👁 ${formatNum(post.viewCount)}`} size="small" />}
          {post.likeCount > 0 && !['telegram','bale','rubika','eitaa'].includes(post.sourceType) && (
            <Chip label={`❤️ ${formatNum(post.likeCount)}`} size="small" />
          )}
          {post.retweetCount > 0 && (
            <Chip
              label={`${['telegram','bale','rubika','eitaa'].includes(post.sourceType) ? '↗️' : '🔄'} ${formatNum(post.retweetCount)}`}
              size="small"
            />
          )}
          {post.quoteCount > 0 && <Chip label={`💬 ${formatNum(post.quoteCount)}`} size="small" />}
          {post.replyCount > 0 && <Chip label={`↩️ ${formatNum(post.replyCount)}`} size="small" />}
          {post.bookmarkCount > 0 && <Chip label={`🔖 ${formatNum(post.bookmarkCount)}`} size="small" />}
        </Stack>

        {post.hashtags?.length > 0 && (
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
            {post.hashtags.map((tag) => (
              <Chip key={tag} label={`#${tag}`} size="small" variant="outlined" sx={{ height: 22, fontSize: 10 }} />
            ))}
          </Stack>
        )}

        {/* Meta info row */}
        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.grey[500], 0.04), border: `1px solid ${alpha(theme.palette.grey[500], 0.08)}` }}>
          <Stack direction="row" spacing={3} flexWrap="wrap" alignItems="center">
            {/* Show followers only when non-zero (messaging platforms) */}
            {post.userFollowers > 0 && (
              <Box>
                <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 9, display: 'block' }}>دنبال‌کننده</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{formatNum(post.userFollowers)}</Typography>
              </Box>
            )}
            <Box>
              <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 9, display: 'block' }}>منبع</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{getSourceLabel(post)}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 9, display: 'block' }}>احساس</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: sentConf.color }}>{sentConf.label}</Typography>
            </Box>
            {/* ضریب نفوذ منبع — news only */}
            {post.publisherRank != null && (
              <Box>
                <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 9, display: 'block' }}>ضریب نفوذ منبع</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{post.publisherRank}</Typography>
              </Box>
            )}
            {/* Topic */}
            {post.topic && (
              <Box>
                <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 9, display: 'block' }}>موضوع</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{post.topic}</Typography>
              </Box>
            )}
            {/* Newspaper page number */}
            {post.pageNum != null && (
              <Box>
                <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 9, display: 'block' }}>صفحه</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{post.pageNum}</Typography>
              </Box>
            )}
            {/* Newspaper Jalali date */}
            {post.jdate && (
              <Box>
                <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 9, display: 'block' }}>تاریخ چاپ</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{post.jdate}</Typography>
              </Box>
            )}
            {/* Duration — video/media */}
            {post.duration != null && (
              <Box>
                <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 9, display: 'block' }}>مدت</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {post.duration >= 3600
                    ? `${Math.floor(post.duration / 3600)}:${String(Math.floor((post.duration % 3600) / 60)).padStart(2, '0')}:${String(post.duration % 60).padStart(2, '0')}`
                    : `${Math.floor(post.duration / 60)}:${String(post.duration % 60).padStart(2, '0')}`}
                </Typography>
              </Box>
            )}
            {/* Direct link to original post */}
            {post.postUrl && (
              <Box sx={{ mr: 'auto' }}>
                <Link
                  href={post.postUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="none"
                >
                  <Stack direction="row" alignItems="center" spacing={0.5}
                    sx={{
                      px: 1.5, py: 0.75, borderRadius: 1.5,
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                      color: 'primary.main',
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.14) },
                    }}
                  >
                    <Iconify icon="solar:arrow-right-up-bold" width={14} />
                    <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 11 }}>
                      مشاهده پست اصلی
                    </Typography>
                  </Stack>
                </Link>
              </Box>
            )}
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
  const { data: profile } = useProfile();

  // Profile keywords are used as highlights when the caller doesn't supply their own.
  // The search panel attaches its own `or` keywords; other callers get profile keywords.
  const profileKeywords = profile?.keywords || [];

  const openPost = (post) => {
    // Merge: caller-supplied highlights take priority; fall back to profile keywords
    const highlights = post?.highlights?.length ? post.highlights : profileKeywords;
    setSelected({ ...post, highlights });
  };

  const PostDrawerEl = selected ? (
    <PostDetailDrawer post={selected} onClose={() => setSelected(null)} />
  ) : null;

  return {
    openPost,
    PostDrawer: PostDrawerEl,
  };
}
