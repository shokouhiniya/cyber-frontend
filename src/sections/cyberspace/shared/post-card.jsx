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
import Tooltip from '@mui/material/Tooltip';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { alpha, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { fNum, fShort, toFaDigits, fRelativeFa } from 'src/utils/format-number-fa';

import { CONFIG } from 'src/global-config';
import { useProfile } from 'src/api/dashboard';

import { Iconify } from 'src/components/iconify';
import { SvgColor } from 'src/components/svg-color';
import { SENTIMENT_COLORS } from 'src/components/chart';

// ----------------------------------------------------------------------

// Every emotion / sentiment label maps to one of three tones so colours
// match the sentiment colours used in the charts.
const SENTIMENT_CONFIG = {
  // Emotion labels (from our own NLP pipeline)
  joy: { tone: 'positive', icon: 'solar:emoji-funny-circle-bold', label: 'شاد' },
  hope: { tone: 'positive', icon: 'solar:sun-bold', label: 'امیدوار' },
  optimism: { tone: 'positive', icon: 'solar:star-bold', label: 'خوش‌بین' },
  optimistic: { tone: 'positive', icon: 'solar:star-bold', label: 'خوش‌بین' },
  confident: { tone: 'positive', icon: 'solar:shield-check-bold', label: 'مطمئن' },
  excitement: { tone: 'positive', icon: 'solar:star-shine-bold', label: 'هیجان' },
  pride: { tone: 'positive', icon: 'solar:crown-bold', label: 'افتخار' },
  interest: { tone: 'positive', icon: 'solar:eye-bold', label: 'علاقه' },
  surprise: { tone: 'neutral', icon: 'solar:star-shine-bold', label: 'شگفتی' },
  concern: { tone: 'negative', icon: 'solar:shield-warning-bold', label: 'نگرانی' },
  worry: { tone: 'negative', icon: 'solar:danger-triangle-bold', label: 'اضطراب' },
  anxious: { tone: 'negative', icon: 'solar:danger-triangle-bold', label: 'مضطرب' },
  apprehensive: { tone: 'negative', icon: 'solar:shield-warning-bold', label: 'بیمناک' },
  frustration: { tone: 'negative', icon: 'solar:fire-bold', label: 'خشم' },
  caution: { tone: 'negative', icon: 'solar:info-circle-bold', label: 'احتیاط' },
  neutral: { tone: 'neutral', icon: 'solar:minus-circle-bold', label: 'خنثی' },
  // Sentiment labels (from 8tag and other sources)
  positive: { tone: 'positive', icon: 'solar:like-bold', label: 'مثبت' },
  negative: { tone: 'negative', icon: 'solar:dislike-bold', label: 'منفی' },
};

// Posts whose sentiment hasn't been computed yet — not the same as «خنثی»
const UNANALYZED = { tone: 'unanalyzed', icon: 'solar:hourglass-line-bold', label: 'تحلیل‌نشده' };

const TONE_PALETTE = { positive: 'success', negative: 'error' };

const SOURCE_ICONS = {
  twitter: 'ri:twitter-x-fill',
  telegram: 'ic:baseline-telegram',
  instagram: 'mdi:instagram',
  news: 'solar:document-text-bold',
  newspaper: 'solar:document-text-bold',
  forum: 'solar:chat-square-bold',
  tv: 'solar:tv-bold',
  video_media: 'solar:videocamera-record-bold',
  aparat: 'solar:videocamera-record-bold-duotone',
  youtube: 'mdi:youtube',
  media: 'solar:tv-bold-duotone',
};

const SOURCE_LABELS = {
  telegram: 'تلگرام',
  bale: 'بله',
  rubika: 'روبیکا',
  eitaa: 'ایتا',
  eita: 'ایتا',
  twitter: 'ایکس',
  instagram: 'اینستاگرام',
  news: 'خبرگزاری',
  newspaper: 'روزنامه',
  media: 'رسانه تصویری',
  tv: 'صدا و سیما',
  video_media: 'رسانه تصویری',
  forum: 'فروم',
  aparat: 'آپارات',
  youtube: 'یوتیوب',
};

const MESSAGING_SOURCES = ['telegram', 'bale', 'rubika', 'eitaa', 'eita'];

export function getSourceLabel(post) {
  // post can be a string (sourceType) or a full post object
  const sourceType = typeof post === 'string' ? post : post?.sourceType;
  const platform = typeof post === 'object' ? post?.platform : null;
  if (sourceType === 'aparat' && platform === 'youtube') return 'یوتیوب';
  return SOURCE_LABELS[sourceType] || sourceType || 'نامشخص';
}

// Iranian platforms use custom SVG files (mono versions with currentColor)
const CUSTOM_SVG_ICONS = {
  rubika: '/assets/icons/social/rubika-mono.svg',
  bale: '/assets/icons/social/bale-mono.svg',
  eitaa: '/assets/icons/social/eitaa-mono.svg',
  eita: '/assets/icons/social/eitaa-mono.svg', // alias
};

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://127.0.0.1:3000';

// Social CDN links expire / refuse hot-linking, so they go through the backend
// media cache (GET /api/media), which fetches each URL once and serves it from
// disk. Must match MEDIA_HOST_ALLOWLIST in the backend media.service.ts.
const CACHED_MEDIA_HOSTS = ['cdninstagram.com', 'fbcdn.net', 'twimg.com', 'telesco.pe', 'telegram.org', 'telegram-cdn.org', '8tag.ir'];
const MEDIA_PROXY_PREFIX = `${CONFIG.serverUrl}/api/media?url=`;

function isCachedMediaHost(url) {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return CACHED_MEDIA_HOSTS.some((d) => host === d || host.endsWith(`.${d}`));
  } catch {
    return false;
  }
}

export function getMediaUrl(url) {
  if (!url) return null;
  if (url.startsWith('/static/')) return `${SERVER_URL}${url}`;
  if (isCachedMediaHost(url)) return `${MEDIA_PROXY_PREFIX}${encodeURIComponent(url)}`;
  return url;
}

/** The original CDN URL behind a media-cache URL (for extension checks). */
function sourceMediaUrl(url) {
  if (!url?.startsWith(MEDIA_PROXY_PREFIX)) return url;
  try {
    return decodeURIComponent(url.slice(MEDIA_PROXY_PREFIX.length));
  } catch {
    return url;
  }
}

/**
 * Sentiment display config: { tone, color, icon, label }.
 * An empty/null value means the post hasn't been analysed yet («تحلیل‌نشده»).
 */
export function getSentimentConfig(emotion) {
  const key = (emotion || '').toString().toLowerCase();
  const conf = key ? SENTIMENT_CONFIG[key] || SENTIMENT_CONFIG.neutral : UNANALYZED;
  return { ...conf, color: SENTIMENT_COLORS[conf.tone] ?? SENTIMENT_COLORS.neutral };
}

/** Readable text colour for a sentiment tone in both light and dark mode. */
function sentimentInk(theme, tone) {
  const key = TONE_PALETTE[tone];
  if (!key) return { color: 'text.secondary' };
  return {
    color: theme.palette[key].dark,
    ...theme.applyStyles('dark', { color: theme.palette[key].light }),
  };
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
    return <SvgColor src={customSvg} sx={{ width, height: width, flexShrink: 0, ...sx }} />;
  }
  const icon = getSourceIcon(sourceType, platform);
  return <Iconify icon={icon} width={width} sx={{ flexShrink: 0, ...sx }} />;
}

/** @deprecated use fShort from src/utils/format-number-fa (kept for older imports). */
export function formatNum(n) {
  return fShort(n || 0);
}

// ----------------------------------------------------------------------
// Media that fails (expired CDN links, 403s) is remembered for the session
// so it is never requested again, and the post falls back to a placeholder
// instead of disappearing.
// ----------------------------------------------------------------------

const FAILED_MEDIA = new Set();

function useMediaFallback(src) {
  const [failedSrc, setFailedSrc] = useState(null);
  const failed = !!src && (failedSrc === src || FAILED_MEDIA.has(src));
  const onError = () => {
    if (!src) return;
    FAILED_MEDIA.add(src);
    setFailedSrc(src);
  };
  return [failed, onError];
}

const isVideoUrl = (url) => !!url && /\.(mp4|webm|mov)(\?|#|$)/i.test(sourceMediaUrl(url));

function PostAvatar({ src, name, size = 36 }) {
  const theme = useTheme();
  const url = getMediaUrl(src);
  const [failed, onError] = useMediaFallback(url);

  return (
    <Avatar
      sx={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        fontWeight: 700,
        color: 'primary.main',
        bgcolor: alpha(theme.palette.primary.main, 0.12),
      }}
    >
      {url && !failed ? (
        <Box
          component="img"
          src={url}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={onError}
          sx={{ width: 1, height: 1, objectFit: 'cover' }}
        />
      ) : (
        name?.charAt(0)?.toUpperCase() || <Iconify icon="solar:user-rounded-bold" width={size * 0.55} />
      )}
    </Avatar>
  );
}

function MediaPlaceholder({ isVideo, height = 56 }) {
  const theme = useTheme();
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="center"
      spacing={1}
      sx={{ height, color: 'text.disabled', bgcolor: alpha(theme.palette.grey[500], 0.08) }}
    >
      <Iconify icon={isVideo ? 'solar:videocamera-record-bold-duotone' : 'solar:gallery-bold-duotone'} width={20} />
      <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
        پیش‌نمایش {isVideo ? 'ویدیو' : 'تصویر'} در دسترس نیست
      </Typography>
    </Stack>
  );
}

function PostMedia({ post, mediaUrl }) {
  const theme = useTheme();
  const isVideo = isVideoUrl(mediaUrl) || post.postType === 'video';
  const [failed, onError] = useMediaFallback(mediaUrl);

  if (!mediaUrl && !post.hasMedia) return null;
  if (!mediaUrl || failed) return <MediaPlaceholder isVideo={isVideo} />;

  return (
    <Box sx={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden', bgcolor: alpha(theme.palette.grey[500], 0.08) }}>
      {isVideoUrl(mediaUrl) ? (
        <Box
          component="video"
          src={mediaUrl}
          muted
          playsInline
          preload="metadata"
          onError={onError}
          sx={{ width: 1, height: 1, objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <Box
          component="img"
          src={mediaUrl}
          alt=""
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={onError}
          sx={{ width: 1, height: 1, objectFit: 'cover', display: 'block' }}
        />
      )}
      {post.postType && (
        <Chip
          label={post.postType}
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            height: 22,
            fontSize: 11,
            color: theme.palette.common.white,
            bgcolor: alpha(theme.palette.common.black, 0.6),
            '& .MuiChip-label': { px: 0.75 },
          }}
        />
      )}
      {isVideoUrl(mediaUrl) && (
        <Stack alignItems="center" justifyContent="center" sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: alpha(theme.palette.common.black, 0.55) }}
          >
            <Iconify icon="solar:play-bold" width={20} sx={{ color: theme.palette.common.white, ml: 0.25 }} />
          </Stack>
        </Stack>
      )}
    </Box>
  );
}

// ----------------------------------------------------------------------

/** Engagement metrics that apply to this post, in display order. */
function getMetrics(post) {
  const isMessaging = MESSAGING_SOURCES.includes(post.sourceType);
  return [
    { key: 'views', icon: 'solar:eye-linear', label: 'بازدید', value: post.viewCount },
    { key: 'likes', icon: 'solar:heart-linear', label: 'پسند', value: isMessaging ? 0 : post.likeCount },
    {
      key: 'shares',
      icon: 'solar:forward-linear',
      label: isMessaging ? 'فوروارد' : 'بازنشر',
      value: post.retweetCount,
    },
    { key: 'quotes', icon: 'solar:chat-square-linear', label: 'نقل‌قول', value: post.quoteCount },
    { key: 'replies', icon: 'solar:chat-line-linear', label: 'کامنت', value: post.replyCount },
    { key: 'bookmarks', icon: 'solar:bookmark-linear', label: 'نشانک', value: post.bookmarkCount },
  ].filter((m) => m.value > 0);
}

function SentimentChip({ conf, size = 'small' }) {
  const theme = useTheme();
  return (
    <Chip
      label={conf.label}
      size="small"
      icon={<Iconify icon={conf.icon} width={size === 'small' ? 14 : 16} />}
      sx={{
        height: size === 'small' ? 24 : 28,
        fontSize: size === 'small' ? 12 : 13,
        fontWeight: 700,
        bgcolor: alpha(conf.color, conf.tone === 'unanalyzed' ? 0.1 : 0.16),
        ...sentimentInk(theme, conf.tone),
        '& .MuiChip-icon': { color: conf.color, ml: 0.5 },
        ...(conf.tone === 'unanalyzed' && {
          bgcolor: 'transparent',
          border: `1px dashed ${alpha(theme.palette.grey[500], 0.4)}`,
        }),
      }}
    />
  );
}

/** Display name + handle following each source's conventions. */
function getAuthor(post) {
  const isNews = ['news', 'newspaper'].includes(post.sourceType);
  if (post.sourceType === 'twitter' && post.displayName) {
    return { name: post.displayName, handle: post.screenName ? `@${post.screenName}` : null };
  }
  if (isNews) return { name: post.screenName || 'نامشخص', handle: null };
  return { name: post.screenName ? `@${post.screenName}` : 'نامشخص', handle: null };
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
  // null → the post hasn't been analysed yet (shown as «تحلیل‌نشده», not «خنثی»)
  const displayEmotion = emotionKey || sentimentKey || null;

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

const CARD_CLAMP_CHARS = 220;

export function PostCard({ post: rawPost, onClick, accentColor, badge, compact }) {
  const theme = useTheme();
  const [textOpen, setTextOpen] = useState(false);

  const post = normalise(rawPost);
  const sentConf = getSentimentConfig(post.emotion);
  const mediaUrl = getMediaUrl(post.mediaUrl);
  const author = getAuthor(post);
  const metrics = getMetrics(post);

  const text = post.text || '';
  const isLong = text.length > CARD_CLAMP_CHARS || text.split('\n').length > 4;

  const handleKeyDown = (event) => {
    if (onClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick(event);
    }
  };

  return (
    <Card
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        overflow: 'hidden',
        borderRadius: 1.5,
        boxShadow: 'none',
        bgcolor: 'background.paper',
        border: `1px solid ${alpha(theme.palette.grey[500], 0.16)}`,
        ...(accentColor && { borderLeft: `3px solid ${accentColor}` }),
        transition: theme.transitions.create(['border-color', 'background-color', 'box-shadow']),
        '&:hover': onClick
          ? {
              bgcolor: alpha(theme.palette.grey[500], 0.04),
              borderColor: alpha(theme.palette.primary.main, 0.32),
              ...(accentColor && { borderLeftColor: accentColor }),
            }
          : {},
        '&:focus-visible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 2 },
      }}
    >
      {!compact && <PostMedia post={post} mediaUrl={mediaUrl} />}

      <Box sx={{ p: 1.75 }}>
        {/* Header: author · platform · time — optional badge on the far side */}
        <Stack direction="row" alignItems="flex-start" spacing={1.25} sx={{ mb: 1.25 }}>
          <PostAvatar src={post.profileImageUrl} name={post.screenName} size={36} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 14, lineHeight: 1.5 }} noWrap>
              {author.name}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: 'text.secondary', minWidth: 0, overflow: 'hidden' }}>
              <SourceIcon sourceType={post.sourceType} platform={post.platform} width={14} />
              <Typography component="span" sx={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                {getSourceLabel(post)}
              </Typography>
              {author.handle && (
                <Typography component="span" noWrap sx={{ fontSize: 12, minWidth: 0 }}>
                  · {author.handle}
                </Typography>
              )}
              {post.publishedAt && (
                <Tooltip title={formatDateTime(post.publishedAt)} placement="top" arrow>
                  <Typography component="span" sx={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                    · {fRelativeFa(post.publishedAt)}
                  </Typography>
                </Tooltip>
              )}
            </Stack>
          </Box>
          {badge}
        </Stack>

        {/* Retweet attribution */}
        {post.postType === 'retweet' && post.retweetUser && (
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.75, color: 'text.secondary' }}>
            <Iconify icon="solar:repeat-linear" width={14} />
            <Typography sx={{ fontSize: 12 }}>بازنشر از @{post.retweetUser}</Typography>
          </Stack>
        )}

        {/* Title — news/article posts */}
        {post.title && (
          <HighlightedText
            text={post.title}
            keywords={post.highlights}
            component="div"
            sx={{ fontWeight: 700, fontSize: 14, mb: 0.5, lineHeight: 1.6, color: 'text.primary' }}
          />
        )}

        {/* Text — clamped, with an inline expand toggle */}
        <HighlightedText
          text={text || '—'}
          keywords={post.highlights}
          component="div"
          sx={{
            fontSize: 13,
            lineHeight: 1.8,
            color: 'text.primary',
            whiteSpace: 'pre-line',
            overflowWrap: 'anywhere',
            ...(!textOpen && {
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }),
          }}
        />
        {isLong && (
          <Box
            component="button"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setTextOpen((p) => !p);
            }}
            onKeyDown={(e) => e.stopPropagation()}
            sx={{
              mt: 0.25,
              p: 0,
              border: 0,
              bgcolor: 'transparent',
              font: 'inherit',
              fontSize: 12,
              fontWeight: 700,
              color: 'primary.main',
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            {textOpen ? 'نمایش کمتر' : 'ادامه متن'}
          </Box>
        )}

        {/* Emoji reactions (telegram/messaging) */}
        {post.reactions && post.reactions.length > 0 && (
          <Stack direction="row" sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
            {post.reactions.slice(0, 5).map((r, i) => (
              <Stack
                key={i}
                direction="row"
                alignItems="center"
                spacing={0.5}
                sx={{ px: 0.75, py: 0.25, borderRadius: 1, fontSize: 13, bgcolor: alpha(theme.palette.grey[500], 0.1) }}
              >
                <span>{r.reaction}</span>
                <Typography component="span" sx={{ fontSize: 12, color: 'text.secondary', fontWeight: 600 }}>
                  {fShort(r.count)}
                </Typography>
              </Stack>
            ))}
          </Stack>
        )}

        {/* Footer: sentiment + engagement metrics */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            mt: 1.25,
            pt: 1.25,
            gap: 1,
            flexWrap: 'wrap',
            borderTop: `1px dashed ${alpha(theme.palette.grey[500], 0.2)}`,
          }}
        >
          <SentimentChip conf={sentConf} />
          {metrics.length > 0 && (
            <Stack direction="row" alignItems="center" sx={{ gap: 1.25, flexWrap: 'wrap', color: 'text.secondary' }}>
              {metrics.map((m) => (
                <Tooltip key={m.key} title={`${fNum(m.value)} ${m.label}`} arrow>
                  <Stack direction="row" alignItems="center" spacing={0.375}>
                    <Iconify icon={m.icon} width={15} />
                    <Typography component="span" sx={{ fontSize: 12, fontWeight: 600 }}>
                      {fShort(m.value)}
                    </Typography>
                  </Stack>
                </Tooltip>
              ))}
            </Stack>
          )}
        </Stack>
      </Box>
    </Card>
  );
}

// ----------------------------------------------------------------------
// DrawerText — shows text in the drawer, collapsed beyond ~10 lines
// Uses character count as a proxy (≈ 400 chars ≈ 10 lines at drawer width)
// ----------------------------------------------------------------------

const DRAWER_CHAR_LIMIT = 400;

function DrawerText({ text, keywords }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text && text.length > DRAWER_CHAR_LIMIT;
  const displayed = isLong && !expanded ? text.slice(0, DRAWER_CHAR_LIMIT) + '…' : text;

  return (
    <Box sx={{ mb: 2.5 }}>
      <HighlightedText
        text={displayed || 'بدون متن'}
        keywords={keywords}
        component="div"
        sx={{ lineHeight: 2, fontSize: 14, whiteSpace: 'pre-line', overflowWrap: 'anywhere', color: 'text.primary' }}
      />
      {isLong && (
        <Button
          size="small"
          onClick={() => setExpanded((p) => !p)}
          startIcon={<Iconify icon={expanded ? 'solar:alt-arrow-up-linear' : 'solar:alt-arrow-down-linear'} width={16} />}
          sx={{ mt: 0.5, px: 0.5, fontSize: 13 }}
        >
          {expanded ? 'نمایش کمتر' : 'نمایش کامل متن'}
        </Button>
      )}
    </Box>
  );
}

function ExpandableBlock({ open, onToggle, openLabel, closedLabel, children }) {
  const theme = useTheme();
  return (
    <Box sx={{ mb: 2.5 }}>
      <Button
        size="small"
        variant="outlined"
        color="inherit"
        onClick={onToggle}
        startIcon={<Iconify icon={open ? 'solar:alt-arrow-up-linear' : 'solar:alt-arrow-down-linear'} width={16} />}
        sx={{ mb: 1, fontSize: 13 }}
      >
        {open ? openLabel : closedLabel}
      </Button>
      <Collapse in={open} unmountOnExit>
        <Box
          sx={{
            p: 2,
            borderRadius: 1.5,
            bgcolor: alpha(theme.palette.grey[500], 0.06),
            border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
            maxHeight: 400,
            overflow: 'auto',
          }}
        >
          {children}
        </Box>
      </Collapse>
    </Box>
  );
}

function formatDuration(sec) {
  const s = Math.max(0, Math.round(sec));
  const pad = (n) => String(n).padStart(2, '0');
  const value =
    s >= 3600
      ? `${Math.floor(s / 3600)}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`
      : `${Math.floor(s / 60)}:${pad(s % 60)}`;
  return toFaDigits(value);
}

function MetaItem({ label, children, color }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ color: 'text.secondary', fontSize: 12, mb: 0.25 }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 700, color }} noWrap>
        {children}
      </Typography>
    </Box>
  );
}

function DrawerMedia({ mediaUrl }) {
  const theme = useTheme();
  const [failed, onError] = useMediaFallback(mediaUrl);
  const isVideo = isVideoUrl(mediaUrl);

  if (!mediaUrl) return null;
  if (failed) {
    return (
      <Box sx={{ mb: 2.5, borderRadius: 1.5, overflow: 'hidden' }}>
        <MediaPlaceholder isVideo={isVideo} height={72} />
      </Box>
    );
  }

  const sx = {
    width: 1,
    maxHeight: { xs: 300, md: 380 },
    borderRadius: 1.5,
    mb: 2.5,
    display: 'block',
    bgcolor: alpha(theme.palette.grey[500], 0.08),
  };

  return isVideo ? (
    <Box component="video" src={mediaUrl} controls playsInline preload="metadata" onError={onError} sx={sx} />
  ) : (
    <Box
      component="img"
      src={mediaUrl}
      alt=""
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={onError}
      sx={{ ...sx, objectFit: 'contain' }}
    />
  );
}

// ----------------------------------------------------------------------

export function PostDetailDrawer({ post: rawPost, onClose }) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'), { noSsr: true });
  const [fullTextOpen, setFullTextOpen] = useState(false);

  if (!rawPost) return null;

  const post = normalise(rawPost);
  const sentConf = getSentimentConfig(post.emotion);
  const mediaUrl = getMediaUrl(post.mediaUrl);
  const isNews = ['news', 'newspaper'].includes(post.sourceType);
  const author = getAuthor(post);
  const metrics = getMetrics(post);

  return (
    <Drawer
      anchor={isDesktop ? 'left' : 'bottom'}
      open
      onClose={onClose}
      slotProps={{
        paper: {
          sx: isDesktop
            ? { width: 560, maxWidth: '100vw', display: 'flex', flexDirection: 'column' }
            : {
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                maxHeight: '92vh',
                display: 'flex',
                flexDirection: 'column',
              },
        },
      }}
    >
      {/* Drag handle (bottom sheet only) */}
      {!isDesktop && (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1.5, pb: 1 }}>
          <Box sx={{ width: 36, height: 4, borderRadius: 2, bgcolor: alpha(theme.palette.grey[500], 0.3) }} />
        </Box>
      )}

      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={1.5}
        sx={{
          px: { xs: 2.5, md: 3 },
          pt: { xs: 0, md: 2.5 },
          pb: 2,
          borderBottom: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
          <PostAvatar src={post.profileImageUrl} name={post.screenName} size={44} />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>
              {author.name}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: 'text.secondary', minWidth: 0, overflow: 'hidden' }}>
              <SourceIcon sourceType={post.sourceType} platform={post.platform} width={14} />
              <Typography component="span" noWrap sx={{ fontSize: 12 }}>
                {[getSourceLabel(post), author.handle, formatDateTime(post.publishedAt)].filter(Boolean).join(' · ')}
              </Typography>
            </Stack>
          </Box>
        </Stack>
        <IconButton onClick={onClose} aria-label="بستن">
          <Iconify icon="mingcute:close-line" width={22} />
        </IconButton>
      </Stack>

      {/* Scrollable content */}
      <Box sx={{ overflow: 'auto', flex: 1, px: { xs: 2.5, md: 3 }, pt: 2.5, pb: 3 }}>
        <DrawerMedia mediaUrl={mediaUrl} />

        {/* Title for news */}
        {post.title && (
          <HighlightedText
            text={post.title}
            keywords={post.highlights}
            component="div"
            sx={{ fontWeight: 700, mb: 1.5, lineHeight: 1.7, fontSize: 17, color: 'text.primary' }}
          />
        )}

        {/* Abstract / main text — clamped to ~10 lines with expand toggle */}
        <DrawerText text={post.text || 'بدون متن'} keywords={post.highlights} />

        {/* Collapsible video description — aparat/youtube */}
        {post.sourceType === 'aparat' && post.fullText && (
          <ExpandableBlock
            open={fullTextOpen}
            onToggle={() => setFullTextOpen((p) => !p)}
            openLabel="بستن توضیحات"
            closedLabel="مشاهده توضیحات ویدیو"
          >
            <HighlightedText
              text={post.fullText}
              keywords={post.highlights}
              component="div"
              sx={{ lineHeight: 2, fontSize: 13, whiteSpace: 'pre-line', color: 'text.secondary' }}
            />
          </ExpandableBlock>
        )}

        {/* Collapsible full article — news only */}
        {isNews && post.fullText && post.fullText !== post.text && (
          <ExpandableBlock
            open={fullTextOpen}
            onToggle={() => setFullTextOpen((p) => !p)}
            openLabel="بستن متن کامل"
            closedLabel="مشاهده متن کامل خبر"
          >
            <Typography variant="body2" sx={{ lineHeight: 2, fontSize: 13, whiteSpace: 'pre-line', color: 'text.secondary' }}>
              {post.fullText}
            </Typography>
          </ExpandableBlock>
        )}

        {/* Emoji reactions */}
        {post.reactions && post.reactions.length > 0 && (
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mb: 2.5 }}>
            {post.reactions.map((r, i) => (
              <Stack
                key={i}
                direction="row"
                alignItems="center"
                spacing={0.5}
                sx={{ px: 1, py: 0.5, borderRadius: 1.5, fontSize: 14, bgcolor: alpha(theme.palette.grey[500], 0.1) }}
              >
                <span>{r.reaction}</span>
                <Typography component="span" sx={{ fontSize: 12, color: 'text.secondary', fontWeight: 700 }}>
                  {fShort(r.count)}
                </Typography>
              </Stack>
            ))}
          </Stack>
        )}

        {/* Sentiment + engagement */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
          <SentimentChip conf={sentConf} size="medium" />
        </Stack>
        {metrics.length > 0 && (
          <Box
            sx={{
              mb: 2.5,
              display: 'grid',
              gap: 1,
              gridTemplateColumns: 'repeat(auto-fill, minmax(104px, 1fr))',
            }}
          >
            {metrics.map((m) => (
              <Stack
                key={m.key}
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ p: 1.25, borderRadius: 1.5, bgcolor: alpha(theme.palette.grey[500], 0.06) }}
              >
                <Iconify icon={m.icon} width={20} sx={{ color: 'text.secondary', flexShrink: 0 }} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 14, lineHeight: 1.3 }}>{fShort(m.value)}</Typography>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{m.label}</Typography>
                </Box>
              </Stack>
            ))}
          </Box>
        )}

        {post.hashtags?.length > 0 && (
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: 2.5 }}>
            {post.hashtags.map((tag) => (
              <Chip key={tag} label={`#${tag}`} size="small" variant="outlined" sx={{ height: 24, fontSize: 12 }} />
            ))}
          </Stack>
        )}

        {/* Meta info */}
        <Box
          sx={{
            p: 2,
            borderRadius: 1.5,
            bgcolor: alpha(theme.palette.grey[500], 0.04),
            border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
            display: 'grid',
            gap: 2,
            gridTemplateColumns: 'repeat(auto-fill, minmax(112px, 1fr))',
          }}
        >
          <MetaItem label="منبع">{getSourceLabel(post)}</MetaItem>
          <MetaItem label="احساس" color={sentConf.tone === 'unanalyzed' ? 'text.secondary' : sentConf.color}>
            {sentConf.label}
          </MetaItem>
          {post.userFollowers > 0 && <MetaItem label="دنبال‌کننده">{fShort(post.userFollowers)}</MetaItem>}
          {post.publisherRank != null && <MetaItem label="ضریب نفوذ منبع">{fNum(post.publisherRank)}</MetaItem>}
          {post.topic && <MetaItem label="موضوع">{post.topic}</MetaItem>}
          {post.pageNum != null && <MetaItem label="صفحه">{fNum(post.pageNum)}</MetaItem>}
          {post.jdate && <MetaItem label="تاریخ چاپ">{toFaDigits(post.jdate)}</MetaItem>}
          {post.duration != null && <MetaItem label="مدت">{formatDuration(post.duration)}</MetaItem>}
        </Box>

        {/* Links to the original */}
        {(post.postUrl || post.articleUrl) && (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2.5 }}>
            {post.postUrl && (
              <Button
                component={Link}
                href={post.postUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="soft"
                color="primary"
                startIcon={<Iconify icon="solar:arrow-right-up-linear" width={18} />}
              >
                مشاهده پست اصلی
              </Button>
            )}
            {post.articleUrl && (
              <Button
                component={Link}
                href={post.articleUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="outlined"
                color="inherit"
                startIcon={<Iconify icon="solar:link-linear" width={18} />}
              >
                مشاهده خبر در منبع اصلی
              </Button>
            )}
          </Stack>
        )}
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
