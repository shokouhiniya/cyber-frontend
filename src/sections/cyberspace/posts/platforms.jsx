import { Iconify } from 'src/components/iconify';
import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------
// One registry for every source the posts page shows: label, icon (Iconify
// name or a mono SVG that follows currentColor), brand colour and the
// profile-URL prefix. `color: null` means "no brand colour" — render it with
// the theme's text colour so it stays readable in dark mode (X is black).
// ----------------------------------------------------------------------

export const PLATFORMS = {
  twitter: { label: 'ایکس', icon: 'ri:twitter-x-fill', color: null, urlPrefix: 'https://x.com/' },
  instagram: { label: 'اینستاگرام', icon: 'mdi:instagram', color: '#D206BD', urlPrefix: 'https://instagram.com/' },
  telegram: { label: 'تلگرام', icon: 'ic:baseline-telegram', color: '#2184FF', urlPrefix: 'https://t.me/' },
  news: { label: 'خبرگزاری', icon: 'solar:document-text-bold', color: '#4CAF50', urlPrefix: null },
  newspaper: { label: 'روزنامه', icon: 'solar:global-bold-duotone', color: '#78909C', urlPrefix: null },
  media: { label: 'صدا و سیما', icon: 'solar:tv-bold-duotone', color: '#FF5722', urlPrefix: null },
  eitaa: { label: 'ایتا', svg: '/assets/icons/social/eitaa-mono.svg', color: '#FAA61A', urlPrefix: null },
  rubika: { label: 'روبیکا', svg: '/assets/icons/social/rubika-mono.svg', color: '#E0C200', urlPrefix: null },
  bale: { label: 'بله', svg: '/assets/icons/social/bale-mono.svg', color: '#008490', urlPrefix: null },
  comments: { label: 'کامنت‌ها', icon: 'solar:chat-line-bold-duotone', color: null, urlPrefix: null, disabled: true },
  forum: { label: 'فروم', icon: 'solar:chat-square-bold-duotone', color: '#795548', urlPrefix: null },
  aparat: { label: 'ویدئویی', icon: 'solar:videocamera-record-bold-duotone', color: '#FF5722', urlPrefix: 'https://aparat.com/' },
};

// Aliases seen in the data for the same platforms
const ALIASES = {
  x: 'twitter',
  eita: 'eitaa',
  tv: 'media',
  video_media: 'media',
  youtube: 'aparat',
};

/** Display order of the platform pills. */
export const PLATFORM_ORDER = [
  'twitter',
  'instagram',
  'telegram',
  'news',
  'newspaper',
  'media',
  'eitaa',
  'rubika',
  'bale',
  'forum',
  'aparat',
  'comments',
];

const FALLBACK = { label: 'نامشخص', icon: 'solar:global-bold-duotone', color: null, urlPrefix: null };

/** Always returns a usable { key, label, icon|svg, color, urlPrefix }. */
export function getPlatform(key) {
  const raw = (key || '').toString().toLowerCase();
  const k = ALIASES[raw] || raw;
  const meta = PLATFORMS[k];
  if (meta) return { key: k, ...meta };
  // Unknown key: keep the raw key as label so nothing is silently "نامشخص"
  return { ...FALLBACK, key: raw, label: raw || FALLBACK.label };
}

/** Platform icon (mono SVG or Iconify), coloured with the brand colour or the text colour. */
export function PlatformIcon({ platform, width = 18, color, sx }) {
  const meta = typeof platform === 'string' ? getPlatform(platform) : platform;
  const tone = color ?? meta.color ?? 'text.primary';

  if (meta.svg) {
    return <SvgColor src={meta.svg} sx={{ width, height: width, flexShrink: 0, color: tone, ...sx }} />;
  }
  return <Iconify icon={meta.icon} width={width} sx={{ flexShrink: 0, color: tone, ...sx }} />;
}
