/**
 * Canonical platform definitions for official channels.
 * Used by both the display component and the admin editor.
 *
 * `iconType`:
 *   'iconify' — use the Iconify <Iconify icon={icon} /> component
 *   'img'     — use <img src={icon} /> (local SVG in /assets/icons/social/)
 */
export const PLATFORMS = [
  {
    id: 'web',
    label: 'وب‌سایت',
    iconType: 'iconify',
    icon: 'solar:global-bold-duotone',
    color: '#2196F3',
    placeholder: 'example.ir',
    urlPrefix: 'https://',
  },
  {
    id: 'telegram',
    label: 'تلگرام',
    iconType: 'iconify',
    icon: 'ic:baseline-telegram',
    color: '#0088cc',
    placeholder: 'channel_name',
    urlPrefix: 'https://t.me/',
  },
  {
    id: 'x',
    label: 'ایکس (توییتر)',
    iconType: 'iconify',
    icon: 'ri:twitter-x-fill',
    color: '#000000',
    placeholder: 'username',
    urlPrefix: 'https://x.com/',
  },
  {
    id: 'instagram',
    label: 'اینستاگرام',
    iconType: 'iconify',
    icon: 'mdi:instagram',
    color: '#E4405F',
    placeholder: 'username',
    urlPrefix: 'https://instagram.com/',
  },
  {
    id: 'bale',
    label: 'بله',
    iconType: 'img',
    icon: '/assets/icons/social/bale.svg',
    color: '#00A86B',
    placeholder: 'channel_name',
    urlPrefix: 'https://bale.ai/',
  },
  {
    id: 'eitaa',
    label: 'ایتا',
    iconType: 'img',
    icon: '/assets/icons/social/eitaa.svg',
    color: '#F57C00',
    placeholder: 'channel_name',
    urlPrefix: 'https://eitaa.com/',
  },
  {
    id: 'rubika',
    label: 'روبیکا',
    iconType: 'img',
    icon: '/assets/icons/social/rubika.svg',
    color: '#7C3AED',
    placeholder: 'channel_name',
    urlPrefix: 'https://rubika.ir/',
  },
];

export const platformById = Object.fromEntries(PLATFORMS.map((p) => [p.id, p]));
export function getPlatformUrl(channel) {
  if (channel.url) return channel.url;
  const cfg = platformById[channel.platform];
  if (!cfg) return null;
  if (channel.platform === 'web') {
    return channel.handle.startsWith('http') ? channel.handle : `https://${channel.handle}`;
  }
  return `${cfg.urlPrefix}${channel.handle}`;
}
