/**
 * Canonical platform definitions for official channels.
 * Used by both the display component and the admin editor.
 *
 * `iconType`:
 *   'iconify' — use the Iconify <Iconify icon={icon} /> component
 *   'img'     — use <img src={icon} /> (local SVG in /assets/icons/social/)
 *
 * `sourceType` is the post `sourceType` the platform's posts are stored under,
 * and `ingested` marks platforms whose official-page posts the backend actually
 * collects (OfficialPagesFeedService — currently Telegram only).
 */
export const PLATFORMS = [
  {
    id: 'web',
    sourceType: null,
    ingested: false,
    label: 'وب‌سایت',
    iconType: 'iconify',
    icon: 'solar:global-bold-duotone',
    color: '#2196F3',
    placeholder: 'example.ir',
    urlPrefix: 'https://',
  },
  {
    id: 'telegram',
    sourceType: 'telegram',
    ingested: true,
    label: 'تلگرام',
    iconType: 'iconify',
    icon: 'ic:baseline-telegram',
    color: '#2184FF',
    placeholder: 'channel_name',
    urlPrefix: 'https://t.me/',
  },
  {
    id: 'x',
    sourceType: 'twitter',
    ingested: false,
    label: 'ایکس (توییتر)',
    iconType: 'iconify',
    icon: 'ri:twitter-x-fill',
    color: '#000000',
    placeholder: 'username',
    urlPrefix: 'https://x.com/',
  },
  {
    id: 'instagram',
    sourceType: 'instagram',
    ingested: false,
    label: 'اینستاگرام',
    iconType: 'iconify',
    icon: 'mdi:instagram',
    color: '#D206BD',
    placeholder: 'username',
    urlPrefix: 'https://instagram.com/',
  },
  {
    id: 'bale',
    sourceType: 'bale',
    ingested: false,
    label: 'بله',
    iconType: 'img',
    icon: '/assets/icons/social/bale.svg',
    color: '#008490',
    placeholder: 'channel_name',
    urlPrefix: 'https://bale.ai/',
  },
  {
    id: 'eitaa',
    sourceType: 'eitaa',
    ingested: false,
    label: 'ایتا',
    iconType: 'img',
    icon: '/assets/icons/social/eitaa.svg',
    color: '#FAA61A',
    placeholder: 'channel_name',
    urlPrefix: 'https://eitaa.com/',
  },
  {
    id: 'rubika',
    sourceType: 'rubika',
    ingested: false,
    label: 'روبیکا',
    iconType: 'img',
    icon: '/assets/icons/social/rubika.svg',
    color: '#E0C200',
    placeholder: 'channel_name',
    urlPrefix: 'https://rubika.ir/',
  },
];

export const platformById = Object.fromEntries(PLATFORMS.map((p) => [p.id, p]));
/** Lower-case handle without a leading @ — for matching channels to posts. */
export function normalizeHandle(handle) {
  return String(handle ?? '')
    .trim()
    .replace(/^@/, '')
    .toLowerCase();
}

export function getPlatformUrl(channel) {
  if (channel.url) return channel.url;
  const cfg = platformById[channel.platform];
  const handle = String(channel.handle ?? '').trim();
  if (!cfg || !handle) return null;
  if (channel.platform === 'web') {
    return handle.startsWith('http') ? handle : `https://${handle}`;
  }
  return `${cfg.urlPrefix}${handle.replace(/^@/, '')}`;
}
