import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import { alpha, useTheme } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const narratives = [
  {
    official: 'افتتاح پروژه',
    officialPercent: 10,
    public: [
      {
        topic: 'هزینه پروژه',
        percent: 45,
        sentiment: 'negative',
        traces: [
          { platform: 'توییتر', user: '@econ_critic', followers: '۸۹k', text: 'هزینه واقعی این پروژه ۳ برابر بودجه اعلام‌شده است...', time: '۳ ساعت پیش', reposts: 1240 },
          { platform: 'تلگرام', user: 'کانال تحلیل اقتصاد', followers: '۱۲۰k', text: 'گزارش محرمانه نشان می‌دهد بودجه پروژه از ابتدا غیرواقعی بوده', time: '۵ ساعت پیش', reposts: 890 },
          { platform: 'خبرگزاری', user: 'ایسنا', followers: '—', text: 'نماینده مجلس: هزینه‌های پروژه باید شفاف‌سازی شود', time: '۱ روز پیش', reposts: 2100 },
        ],
      },
      {
        topic: 'زمان‌بندی',
        percent: 30,
        sentiment: 'neutral',
        traces: [
          { platform: 'توییتر', user: '@project_watch', followers: '۴۵k', text: 'تأخیر ۸ ماهه در فاز دوم پروژه هنوز توضیح داده نشده', time: '۶ ساعت پیش', reposts: 560 },
          { platform: 'اینستاگرام', user: '@news_daily', followers: '۲۳۰k', text: 'مقایسه زمان‌بندی اعلام‌شده با واقعیت اجرا', time: '۲ روز پیش', reposts: 340 },
        ],
      },
      {
        topic: 'کیفیت',
        percent: 15,
        sentiment: 'negative',
        traces: [
          { platform: 'تلگرام', user: 'انجمن مهندسین', followers: '۶۷k', text: 'استانداردهای ساخت در این پروژه رعایت نشده است', time: '۱ روز پیش', reposts: 780 },
        ],
      },
    ],
    gapLevel: 'high',
  },
];

const PLATFORM_ICONS = {
  'توییتر': 'ri:twitter-x-fill',
  'تلگرام': 'ic:baseline-telegram',
  'اینستاگرام': 'mdi:instagram',
  'خبرگزاری': 'solar:document-text-bold',
};

export function NarrativeGap({ loading }) {
  const theme = useTheme();
  const [openTrace, setOpenTrace] = useState(null);

  const toggleTrace = (key) => setOpenTrace((prev) => (prev === key ? null : key));

  const getGapColor = (level) => {
    switch (level) {
      case 'high':
        return { color: '#FF6B6B', label: 'شکاف بالا', icon: 'solar:danger-triangle-bold' };
      case 'medium':
        return { color: '#FFA94D', label: 'شکاف متوسط', icon: 'solar:info-circle-bold' };
      default:
        return { color: '#51CF66', label: 'هم‌راستا', icon: 'solar:check-circle-bold' };
    }
  };

  const getSentimentColor = (s) => {
    if (s === 'negative') return '#FF6B6B';
    if (s === 'positive') return '#51CF66';
    return '#ADB5BD';
  };

  if (loading) {
    return (
      <Card sx={{ p: 2, borderRadius: 2, boxShadow: theme.shadows[2] }}>
        <CircularProgress size={24} />
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: 2.5, overflow: 'hidden', boxShadow: theme.shadows[2] }}>
      <Box
        sx={{
          p: 2,
          background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.08)} 0%, ${alpha(theme.palette.warning.main, 0.08)} 100%)`,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ width: 40, height: 40, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.error.main, 0.16) }}>
            <Iconify icon="solar:soundwave-bold-duotone" width={24} sx={{ color: theme.palette.error.main }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>تحلیل شکاف روایت</Typography>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ p: 2 }}>
        {narratives.map((narrative, nIdx) => {
          const gap = getGapColor(narrative.gapLevel);
          return (
            <Stack key={nIdx} spacing={2}>
              {/* Gap Level */}
              <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: alpha(gap.color, 0.08), border: `1px solid ${alpha(gap.color, 0.24)}` }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify icon={gap.icon} width={20} sx={{ color: gap.color }} />
                  <Typography variant="body2" sx={{ fontWeight: 700, color: gap.color, fontSize: 12 }}>{gap.label}</Typography>
                </Stack>
              </Box>

              {/* Official Message */}
              <Box>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Iconify icon="solar:microphone-bold" width={16} sx={{ color: theme.palette.primary.main }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 11 }}>پیام رسمی</Typography>
                </Stack>
                <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.08), border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}` }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 12 }}>{narrative.official}</Typography>
                    <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700 }}>{narrative.officialPercent}%</Typography>
                  </Stack>
                </Box>
              </Box>

              {/* Public Discussion */}
              <Box>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Iconify icon="solar:users-group-rounded-bold" width={16} sx={{ color: theme.palette.info.main }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 11 }}>بحث مردم</Typography>
                </Stack>
                <Stack spacing={1.5}>
                  {narrative.public.map((item, idx) => {
                    const traceKey = `${nIdx}-${idx}`;
                    const isTraceOpen = openTrace === traceKey;
                    const sentColor = getSentimentColor(item.sentiment);

                    return (
                      <Box key={idx}>
                        {/* Topic bar + trace button */}
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 600, fontSize: 11 }}>{item.topic}</Typography>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 11, color: sentColor }}>
                              {item.percent}%
                            </Typography>
                            <ButtonBase
                              onClick={() => toggleTrace(traceKey)}
                              sx={{
                                px: 1, py: 0.25, borderRadius: 1,
                                bgcolor: alpha(theme.palette.warning.main, isTraceOpen ? 0.16 : 0.08),
                                border: `1px solid ${alpha(theme.palette.warning.main, isTraceOpen ? 0.4 : 0.16)}`,
                                transition: 'all 0.2s',
                                '&:hover': { bgcolor: alpha(theme.palette.warning.main, 0.16) },
                              }}
                            >
                              <Stack direction="row" alignItems="center" spacing={0.5}>
                                <Iconify icon="solar:map-arrow-right-bold" width={12} sx={{ color: theme.palette.warning.main }} />
                                <Typography variant="caption" sx={{ fontSize: 9, fontWeight: 700, color: theme.palette.warning.main }}>
                                  ردیابی منبع
                                </Typography>
                              </Stack>
                            </ButtonBase>
                          </Stack>
                        </Stack>

                        <LinearProgress
                          variant="determinate"
                          value={item.percent}
                          sx={{
                            height: 6, borderRadius: 1,
                            bgcolor: alpha(theme.palette.grey[500], 0.08),
                            '& .MuiLinearProgress-bar': { bgcolor: sentColor, borderRadius: 1 },
                          }}
                        />

                        {/* Trace panel */}
                        <Collapse in={isTraceOpen} timeout={250}>
                          <Box sx={{ mt: 1, p: 1.5, borderRadius: 1.5, bgcolor: alpha(theme.palette.warning.main, 0.04), border: `1px solid ${alpha(theme.palette.warning.main, 0.12)}` }}>
                            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
                              <Iconify icon="solar:route-bold" width={14} sx={{ color: theme.palette.warning.main }} />
                              <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 700, color: theme.palette.warning.main }}>
                                زنجیره انتشار ({item.traces.length} منبع شناسایی‌شده)
                              </Typography>
                            </Stack>
                            <Stack spacing={1}>
                              {item.traces.map((trace, ti) => (
                                <Box
                                  key={ti}
                                  sx={{
                                    p: 1.25, borderRadius: 1.5,
                                    bgcolor: alpha(theme.palette.grey[500], 0.04),
                                    border: `1px solid ${alpha(theme.palette.grey[500], 0.08)}`,
                                  }}
                                >
                                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.75 }}>
                                    <Iconify icon={PLATFORM_ICONS[trace.platform] || 'solar:global-bold'} width={14} sx={{ color: 'text.secondary' }} />
                                    <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 10 }}>{trace.user}</Typography>
                                    <Chip label={trace.platform} size="small" sx={{ height: 16, fontSize: 8, fontWeight: 600, bgcolor: alpha(theme.palette.grey[500], 0.08) }} />
                                    {trace.followers !== '—' && (
                                      <Typography variant="caption" sx={{ fontSize: 8, color: 'text.disabled' }}>{trace.followers} دنبال‌کننده</Typography>
                                    )}
                                  </Stack>
                                  <Typography variant="caption" sx={{ fontSize: 10, color: 'text.primary', lineHeight: 1.6, display: 'block', mb: 0.5 }}>
                                    {trace.text}
                                  </Typography>
                                  <Stack direction="row" alignItems="center" spacing={1.5}>
                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                      <Iconify icon="solar:clock-circle-linear" width={10} sx={{ color: 'text.disabled' }} />
                                      <Typography variant="caption" sx={{ fontSize: 8, color: 'text.disabled' }}>{trace.time}</Typography>
                                    </Stack>
                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                      <Iconify icon="solar:share-linear" width={10} sx={{ color: 'text.disabled' }} />
                                      <Typography variant="caption" sx={{ fontSize: 8, color: 'text.disabled' }}>{trace.reposts.toLocaleString('fa-IR')} بازنشر</Typography>
                                    </Stack>
                                  </Stack>
                                </Box>
                              ))}
                            </Stack>
                          </Box>
                        </Collapse>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>

              {/* Insight */}
              <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: alpha(theme.palette.info.main, 0.08), border: `1px solid ${alpha(theme.palette.info.main, 0.16)}` }}>
                <Stack direction="row" spacing={1}>
                  <Iconify icon="solar:lightbulb-bolt-bold" width={16} sx={{ color: theme.palette.info.main, flexShrink: 0, mt: 0.25 }} />
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 10, lineHeight: 1.6 }}>
                    پیام شما به درستی منتقل نشده است. مردم بیشتر درباره هزینه‌ها صحبت می‌کنند تا دستاورد پروژه.
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          );
        })}
      </Box>
    </Card>
  );
}
