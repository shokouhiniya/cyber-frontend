import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function TabRecommendations({ loading }) {
  const theme = useTheme();

  const recommendations = [
    {
      id: 1,
      type: 'urgent',
      title: 'پاسخ فوری به ابهامات',
      description:
        'با توجه به افزایش ۴۵٪ ابهامات در مورد پروژه ملی، پیشنهاد می‌شود یک پست توضیحی جامع در ساعت ۱۸:۰۰ امروز منتشر کنید.',
      reason: 'افزایش سوالات و نگرانی‌های کاربران',
      suggestedTime: 'امروز ۱۸:۰۰',
      platform: 'توییتر و تلگرام',
      icon: 'solar:danger-triangle-bold-duotone',
    },
    {
      id: 2,
      type: 'important',
      title: 'تقویت محتوای مثبت',
      description:
        'روند احساسات مثبت در حال کاهش است. انتشار محتوای موفقیت‌آمیز پروژه‌های قبلی می‌تواند به بهبود وضعیت کمک کند.',
      reason: 'کاهش ۱۲٪ احساسات مثبت در ۳ روز اخیر',
      suggestedTime: 'فردا ۱۰:۰۰',
      platform: 'اینستاگرام',
      icon: 'solar:star-shine-bold-duotone',
    },
    {
      id: 3,
      type: 'normal',
      title: 'پاسخ به سوالات متداول',
      description:
        'تعداد زیادی سوال تکراری در مورد مراحل اجرایی مشاهده شده. ایجاد یک پست FAQ می‌تواند مفید باشد.',
      reason: 'تکرار ۲۳ سوال مشابه در ۲۴ ساعت گذشته',
      suggestedTime: 'این هفته',
      platform: 'تلگرام',
      icon: 'solar:question-circle-bold-duotone',
    },
    {
      id: 4,
      type: 'normal',
      title: 'تعامل با اینفلوئنسرها',
      description:
        'چند اینفلوئنسر کلیدی در حال بحث درباره موضوعات مرتبط هستند. تعامل با آن‌ها می‌تواند دسترسی را افزایش دهد.',
      reason: 'شناسایی ۵ اینفلوئنسر فعال با ۱۰۰K+ فالوور',
      suggestedTime: 'امروز',
      platform: 'توییتر',
      icon: 'solar:users-group-two-rounded-bold-duotone',
    },
  ];

  const typeConfig = {
    urgent: {
      color: '#FF6B6B',
      label: 'فوری',
      bgcolor: alpha('#FF6B6B', 0.08),
    },
    important: {
      color: '#FFA94D',
      label: 'مهم',
      bgcolor: alpha('#FFA94D', 0.08),
    },
    normal: {
      color: '#74C0FC',
      label: 'عادی',
      bgcolor: alpha('#74C0FC', 0.08),
    },
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={2.5} sx={{ pb: 10 }}>
      {/* Header */}
      <Card
        sx={{
          p: 2.5,
          borderRadius: 2.5,
          background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.12)} 0%, ${alpha(theme.palette.info.main, 0.08)} 100%)`,
          border: `1px solid ${alpha(theme.palette.warning.main, 0.16)}`,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(theme.palette.warning.main, 0.16),
            }}
          >
            <Iconify
              icon="solar:lightbulb-bolt-bold-duotone"
              width={28}
              sx={{ color: theme.palette.warning.main }}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
              پیشنهادات واکنش هوشمند
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 11 }}>
              بر اساس تحلیل داده‌های لحظه‌ای و الگوهای رفتاری
            </Typography>
          </Box>
        </Stack>
      </Card>

      {/* Recommendations List */}
      {recommendations.map((rec) => (
        <Card
          key={rec.id}
          sx={{
            borderRadius: 2.5,
            overflow: 'hidden',
            boxShadow: theme.shadows[2],
            border: `1px solid ${alpha(typeConfig[rec.type].color, 0.16)}`,
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: theme.shadows[8],
              transform: 'translateY(-2px)',
            },
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2,
              bgcolor: typeConfig[rec.type].bgcolor,
              borderBottom: `1px solid ${alpha(typeConfig[rec.type].color, 0.12)}`,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: alpha(typeConfig[rec.type].color, 0.16),
                }}
              >
                <Iconify icon={rec.icon} width={24} sx={{ color: typeConfig[rec.type].color }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: 14 }}>
                  {rec.title}
                </Typography>
              </Box>
              <Chip
                label={typeConfig[rec.type].label}
                size="small"
                sx={{
                  height: 24,
                  fontSize: 11,
                  fontWeight: 700,
                  bgcolor: alpha(typeConfig[rec.type].color, 0.16),
                  color: typeConfig[rec.type].color,
                  border: `1px solid ${alpha(typeConfig[rec.type].color, 0.24)}`,
                }}
              />
            </Stack>
          </Box>

          {/* Content */}
          <Box sx={{ p: 2 }}>
            <Stack spacing={2}>
              {/* Description */}
              <Typography
                variant="body2"
                sx={{
                  color: 'text.primary',
                  lineHeight: 1.7,
                  fontSize: 13,
                }}
              >
                {rec.description}
              </Typography>

              {/* Reason */}
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor: alpha(theme.palette.info.main, 0.04),
                  border: `1px solid ${alpha(theme.palette.info.main, 0.08)}`,
                }}
              >
                <Stack direction="row" alignItems="flex-start" spacing={1}>
                  <Iconify
                    icon="solar:info-circle-bold"
                    width={16}
                    sx={{ color: theme.palette.info.main, mt: 0.2 }}
                  />
                  <Typography variant="caption" sx={{ fontSize: 11, lineHeight: 1.6 }}>
                    <strong>دلیل:</strong> {rec.reason}
                  </Typography>
                </Stack>
              </Box>

              {/* Details */}
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify
                    icon="solar:clock-circle-bold"
                    width={16}
                    sx={{ color: 'text.secondary' }}
                  />
                  <Typography variant="caption" sx={{ fontSize: 11 }}>
                    <strong>زمان پیشنهادی:</strong> {rec.suggestedTime}
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify
                    icon="solar:widget-5-bold"
                    width={16}
                    sx={{ color: 'text.secondary' }}
                  />
                  <Typography variant="caption" sx={{ fontSize: 11 }}>
                    <strong>پلتفرم:</strong> {rec.platform}
                  </Typography>
                </Stack>
              </Stack>

              {/* Actions */}
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Iconify icon="solar:check-circle-bold" width={18} />}
                  sx={{
                    flex: 1,
                    height: 36,
                    fontSize: 12,
                    fontWeight: 700,
                    bgcolor: typeConfig[rec.type].color,
                    '&:hover': {
                      bgcolor: alpha(typeConfig[rec.type].color, 0.8),
                    },
                  }}
                >
                  اجرا کن
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{
                    height: 36,
                    fontSize: 12,
                    fontWeight: 600,
                    borderColor: alpha(typeConfig[rec.type].color, 0.24),
                    color: typeConfig[rec.type].color,
                    '&:hover': {
                      borderColor: typeConfig[rec.type].color,
                      bgcolor: alpha(typeConfig[rec.type].color, 0.04),
                    },
                  }}
                >
                  بعداً
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Card>
      ))}
    </Stack>
  );
}
