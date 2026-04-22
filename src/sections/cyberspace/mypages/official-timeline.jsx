import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const PLATFORM_CONFIG = {
  twitter: { icon: 'ri:twitter-x-fill', color: '#000000', label: 'توییتر' },
  telegram: { icon: 'ic:baseline-telegram', color: '#0088cc', label: 'تلگرام' },
  instagram: { icon: 'mdi:instagram', color: '#E4405F', label: 'اینستاگرام' },
  website: { icon: 'solar:global-bold-duotone', color: '#2196F3', label: 'وب‌سایت' },
};

// Mock integrated timeline from all official accounts
const TIMELINE_ITEMS = [
  {
    id: 1,
    platform: 'twitter',
    text: 'امروز در جلسه شورای فناوری، برنامه جامع توسعه زیرساخت‌های دیجیتال کشور تصویب شد. این برنامه شامل سرمایه‌گذاری ۵۰۰ میلیارد تومانی در حوزه امنیت سایبری است.',
    time: '۲ ساعت پیش',
    likes: 1240,
    retweets: 345,
    views: 45200,
    engagement: 'high',
  },
  {
    id: 2,
    platform: 'telegram',
    text: 'گزارش عملکرد هفتگی:\n✅ افتتاح مرکز نوآوری شماره ۳\n✅ اتمام فاز اول پروژه شبکه ملی\n✅ برگزاری ۴ جلسه با نمایندگان صنعت',
    time: '۵ ساعت پیش',
    likes: 890,
    retweets: 120,
    views: 32100,
    engagement: 'medium',
  },
  {
    id: 3,
    platform: 'instagram',
    text: 'بازدید از نمایشگاه بین‌المللی فناوری اطلاعات. افتخار می‌کنم که شرکت‌های دانش‌بنیان ایرانی محصولات رقابتی در سطح جهانی ارائه می‌دهند.',
    time: '۸ ساعت پیش',
    likes: 3420,
    retweets: 0,
    views: 89400,
    engagement: 'high',
  },
  {
    id: 4,
    platform: 'website',
    text: 'مقاله جدید: «چالش‌ها و فرصت‌های حکمرانی دیجیتال در ایران» — بررسی جامع وضعیت فعلی و نقشه راه آینده.',
    time: '۱ روز پیش',
    likes: 156,
    retweets: 45,
    views: 8900,
    engagement: 'low',
  },
  {
    id: 5,
    platform: 'twitter',
    text: 'از تلاش‌های تیم امنیت سایبری در مقابله با حملات اخیر قدردانی می‌کنم. امنیت فضای مجازی اولویت اصلی ماست.',
    time: '۱ روز پیش',
    likes: 2100,
    retweets: 567,
    views: 67800,
    engagement: 'high',
  },
  {
    id: 6,
    platform: 'telegram',
    text: 'اطلاعیه: جلسه هم‌اندیشی با فعالان حوزه فناوری، چهارشنبه ساعت ۱۰ صبح. حضور همه علاقه‌مندان آزاد است.',
    time: '۲ روز پیش',
    likes: 450,
    retweets: 89,
    views: 18900,
    engagement: 'medium',
  },
];

const formatNum = (n) => {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return n.toLocaleString('fa-IR');
};

const getEngagementColor = (level) => {
  if (level === 'high') return '#51CF66';
  if (level === 'medium') return '#FFA94D';
  return '#ADB5BD';
};

export function OfficialTimeline({ loading }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (loading) {
    return (
      <Card sx={{ p: 2.5, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120, borderRadius: 2.5, boxShadow: theme.shadows[2] }}>
        <CircularProgress />
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: 2.5, overflow: 'hidden', boxShadow: theme.shadows[2] }}>
      {/* Header */}
      <Box
        sx={{
          p: 2.5,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.success.main, 0.08)} 100%)`,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 40, height: 40, borderRadius: 1.5,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: alpha(theme.palette.primary.main, 0.16),
            }}
          >
            <Iconify icon="solar:timeline-up-bold-duotone" width={24} sx={{ color: theme.palette.primary.main }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>تایم‌لاین یکپارچه</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              آخرین انتشارات از تمام صفحات رسمی
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Timeline */}
      <Box sx={{ p: 2 }}>
        <Stack spacing={0}>
          {TIMELINE_ITEMS.map((item, index) => {
            const platform = PLATFORM_CONFIG[item.platform];
            const engColor = getEngagementColor(item.engagement);
            const isLast = index === TIMELINE_ITEMS.length - 1;

            return (
              <Stack key={item.id} direction="row" spacing={2}>
                {/* Timeline line + dot */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 32, flexShrink: 0 }}>
                  <Box
                    sx={{
                      width: 28, height: 28, borderRadius: '50%',
                      bgcolor: alpha(platform.color, 0.12),
                      border: `2px solid ${alpha(platform.color, 0.4)}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      zIndex: 1,
                    }}
                  >
                    <Iconify icon={platform.icon} width={14} sx={{ color: platform.color }} />
                  </Box>
                  {!isLast && (
                    <Box sx={{ width: 2, flex: 1, bgcolor: alpha(theme.palette.grey[500], 0.16) }} />
                  )}
                </Box>

                {/* Content */}
                <Box
                  sx={{
                    flex: 1, pb: 2.5, mb: !isLast ? 0 : 0,
                  }}
                >
                  {/* Platform + time */}
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.75 }}>
                    <Stack direction="row" alignItems="center" spacing={0.75}>
                      <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 11, color: platform.color }}>
                        {platform.label}
                      </Typography>
                      <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'text.disabled' }} />
                      <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 10 }}>
                        {item.time}
                      </Typography>
                    </Stack>
                    <Box
                      sx={{
                        width: 8, height: 8, borderRadius: '50%',
                        bgcolor: engColor,
                        boxShadow: `0 0 6px ${alpha(engColor, 0.5)}`,
                      }}
                    />
                  </Stack>

                  {/* Text */}
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: 12, lineHeight: 1.8, color: 'text.primary',
                      whiteSpace: 'pre-line', mb: 1,
                    }}
                  >
                    {item.text}
                  </Typography>

                  {/* Engagement stats */}
                  <Stack direction="row" spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Iconify icon="solar:heart-bold" width={12} sx={{ color: 'text.disabled' }} />
                      <Typography variant="caption" sx={{ fontSize: 10, color: 'text.secondary', fontWeight: 600 }}>
                        {formatNum(item.likes)}
                      </Typography>
                    </Stack>
                    {item.retweets > 0 && (
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Iconify icon="solar:share-bold" width={12} sx={{ color: 'text.disabled' }} />
                        <Typography variant="caption" sx={{ fontSize: 10, color: 'text.secondary', fontWeight: 600 }}>
                          {formatNum(item.retweets)}
                        </Typography>
                      </Stack>
                    )}
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Iconify icon="solar:eye-bold" width={12} sx={{ color: 'text.disabled' }} />
                      <Typography variant="caption" sx={{ fontSize: 10, color: 'text.secondary', fontWeight: 600 }}>
                        {formatNum(item.views)}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
              </Stack>
            );
          })}
        </Stack>
      </Box>
    </Card>
  );
}
