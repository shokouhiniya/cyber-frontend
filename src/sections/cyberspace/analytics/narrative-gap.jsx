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
    official: '\u0628\u06CC\u0627\u0646\u06CC\u0647 \u062D\u0645\u0627\u06CC\u062A \u0627\u0632 \u0645\u0630\u0627\u06A9\u0631\u0627\u062A',
    officialPercent: 35,
    public: [
      {
        topic: '\u0639\u062F\u0645 \u0631\u0639\u0627\u06CC\u062A \u062E\u0637\u0648\u0637 \u0642\u0631\u0645\u0632',
        percent: 42,
        sentiment: 'negative',
        traces: [
          { platform: '\u062A\u0644\u06AF\u0631\u0627\u0645', user: '\u0627\u0645\u06CC\u0631\u062D\u0633\u06CC\u0646 \u062B\u0627\u0628\u062A\u06CC', followers: '\u06F4\u06F5k', text: '\u0686\u0648\u0646 \u062F\u0631 \u0645\u062A\u0646 \u0646\u0627\u0645\u0647 \u062D\u0645\u0627\u06CC\u062A \u0627\u0632 \u062A\u06CC\u0645 \u0645\u0630\u0627\u06A9\u0631\u0647\u200C\u06A9\u0646\u0646\u062F\u0647 \u0628\u0647 \u0635\u0648\u0631\u062A \u0645\u0637\u0644\u0642 \u0622\u0645\u062F\u0647 \u0628\u0648\u062F \u0648 \u0646\u0647 \u0645\u0634\u0631\u0648\u0637 \u0628\u0647 \u0631\u0639\u0627\u06CC\u062A \u062E\u0637\u0648\u0637 \u0642\u0631\u0645\u0632', time: '\u06F5 \u0633\u0627\u0639\u062A \u067E\u06CC\u0634', reposts: 3420 },
          { platform: '\u0628\u0644\u0647', user: '\u06AF\u06CC\u0632\u0645\u06CC\u0632', followers: '\u06F2\u06F9\u06F9k', text: '\u06F2\u06F6\u06F1 \u0646\u0645\u0627\u06CC\u0646\u062F\u0647 \u0628\u06CC\u0627\u0646\u06CC\u0647 \u062D\u0645\u0627\u06CC\u062A \u0627\u0645\u0636\u0627 \u06A9\u0631\u062F\u0646\u062F \u0627\u0645\u0627 \u06F7 \u0646\u0641\u0631 \u0627\u0645\u0636\u0627 \u0646\u06A9\u0631\u062F\u0646\u062F', time: '\u06F3 \u0633\u0627\u0639\u062A \u067E\u06CC\u0634', reposts: 2890 },
        ],
      },
      {
        topic: '\u0634\u06A9\u0627\u0641 \u062F\u0631 \u062C\u0631\u06CC\u0627\u0646 \u0627\u0635\u0648\u0644\u06AF\u0631\u0627',
        percent: 35,
        sentiment: 'negative',
        traces: [
          { platform: '\u062A\u0644\u06AF\u0631\u0627\u0645', user: '\u0645\u0647\u0633\u062A\u0627\u0646', followers: '\u06F6\u06F9\u06F2', text: '\u0631\u0647\u0628\u0631\u0627\u0646 \u062C\u0628\u0647\u0647 \u067E\u0627\u06CC\u062F\u0627\u0631\u06CC \u0628\u0627 \u0645\u0635\u0627\u062D\u0628\u0647\u200C\u0647\u0627\u06CC \u0645\u062A\u0639\u062F\u062F \u0631\u0648\u0634 \u0645\u0630\u0627\u06A9\u0631\u0647 \u0642\u0627\u0644\u06CC\u0628\u0627\u0641 \u0631\u0627 \u0632\u06CC\u0631 \u0633\u0648\u0627\u0644 \u0628\u0631\u062F\u0646\u062F', time: '\u06F8 \u0633\u0627\u0639\u062A \u067E\u06CC\u0634', reposts: 1560 },
        ],
      },
      {
        topic: '\u0642\u06CC\u0645\u062A \u0646\u0641\u062A',
        percent: 23,
        sentiment: 'neutral',
        traces: [
          { platform: '\u0631\u0648\u0628\u06CC\u06A9\u0627', user: '\u062E\u0628\u0631 \u0641\u0648\u0631\u06CC', followers: '\u06F1\u06F2\u06F0k', text: '\u0642\u0627\u0644\u06CC\u0628\u0627\u0641: \u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u06CC\u0645 \u0627\u06CC\u0646 \u0632\u0645\u0627\u0646 \u062A\u0627 \u06F3\u06F0 \u0631\u0648\u0632 \u062A\u0645\u062F\u06CC\u062F \u06A9\u0646\u06CC\u0645 \u0648 \u0686\u0627\u0647 \u0646\u0641\u062A \u0631\u0627 \u067E\u062E\u0634 \u0632\u0646\u062F\u0647 \u06A9\u0646\u06CC\u0645', time: '\u06F2 \u0633\u0627\u0639\u062A \u067E\u06CC\u0634', reposts: 4200 },
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
                    \u067E\u06CC\u0627\u0645 \u0631\u0633\u0645\u06CC \u062D\u0645\u0627\u06CC\u062A \u0627\u0632 \u0645\u0630\u0627\u06A9\u0631\u0627\u062A \u0628\u0647 \u062F\u0631\u0633\u062A\u06CC \u0645\u0646\u062A\u0642\u0644 \u0646\u0634\u062F\u0647. \u0645\u0631\u062F\u0645 \u0628\u06CC\u0634\u062A\u0631 \u062F\u0631\u0628\u0627\u0631\u0647 \u062E\u0637\u0648\u0637 \u0642\u0631\u0645\u0632 \u0648 \u0634\u06A9\u0627\u0641 \u062F\u0631\u0648\u0646\u06CC \u0627\u0635\u0648\u0644\u06AF\u0631\u0627\u06CC\u0627\u0646 \u0635\u062D\u0628\u062A \u0645\u06CC\u200C\u06A9\u0646\u0646\u062F.
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
