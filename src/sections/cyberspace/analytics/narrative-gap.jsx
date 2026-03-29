import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function NarrativeGap({ loading }) {
  const theme = useTheme();

  // Mock data - what official says vs what people discuss
  const narratives = [
    {
      official: 'افتتاح پروژه',
      officialPercent: 10,
      public: [
        { topic: 'هزینه پروژه', percent: 45, sentiment: 'negative' },
        { topic: 'زمان‌بندی', percent: 30, sentiment: 'neutral' },
        { topic: 'کیفیت', percent: 15, sentiment: 'negative' },
      ],
      gapLevel: 'high', // high, medium, low
    },
  ];

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

  if (loading) {
    return (
      <Card sx={{ p: 2, borderRadius: 2, boxShadow: theme.shadows[2] }}>
        <CircularProgress size={24} />
      </Card>
    );
  }

  return (
    <Card
      sx={{
        borderRadius: 2.5,
        overflow: 'hidden',
        boxShadow: theme.shadows[2],
      }}
    >
      <Box
        sx={{
          p: 2,
          background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.08)} 0%, ${alpha(theme.palette.warning.main, 0.08)} 100%)`,
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
              bgcolor: alpha(theme.palette.error.main, 0.16),
            }}
          >
            <Iconify
              icon="solar:soundwave-bold-duotone"
              width={24}
              sx={{ color: theme.palette.error.main }}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              تحلیل شکاف روایت
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 10 }}>
              Narrative Gap Analysis
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ p: 2 }}>
        {narratives.map((narrative, index) => {
          const gap = getGapColor(narrative.gapLevel);
          return (
            <Stack key={index} spacing={2}>
              {/* Gap Level Indicator */}
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor: alpha(gap.color, 0.08),
                  border: `1px solid ${alpha(gap.color, 0.24)}`,
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify icon={gap.icon} width={20} sx={{ color: gap.color }} />
                  <Typography variant="body2" sx={{ fontWeight: 700, color: gap.color, fontSize: 12 }}>
                    {gap.label}
                  </Typography>
                </Stack>
              </Box>

              {/* Official Message */}
              <Box>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Iconify
                    icon="solar:microphone-bold"
                    width={16}
                    sx={{ color: theme.palette.primary.main }}
                  />
                  <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 11 }}>
                    پیام رسمی
                  </Typography>
                </Stack>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
                  }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 12 }}>
                      {narrative.official}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700 }}>
                      {narrative.officialPercent}%
                    </Typography>
                  </Stack>
                </Box>
              </Box>

              {/* Public Discussion */}
              <Box>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Iconify
                    icon="solar:users-group-rounded-bold"
                    width={16}
                    sx={{ color: theme.palette.info.main }}
                  />
                  <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 11 }}>
                    بحث مردم
                  </Typography>
                </Stack>
                <Stack spacing={1}>
                  {narrative.public.map((item, idx) => (
                    <Box key={idx}>
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{ mb: 0.5 }}
                      >
                        <Typography variant="caption" sx={{ fontWeight: 600, fontSize: 11 }}>
                          {item.topic}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 700,
                            fontSize: 11,
                            color:
                              item.sentiment === 'negative'
                                ? '#FF6B6B'
                                : item.sentiment === 'positive'
                                  ? '#51CF66'
                                  : 'text.secondary',
                          }}
                        >
                          {item.percent}%
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={item.percent}
                        sx={{
                          height: 6,
                          borderRadius: 1,
                          bgcolor: alpha(theme.palette.grey[500], 0.08),
                          '& .MuiLinearProgress-bar': {
                            bgcolor:
                              item.sentiment === 'negative'
                                ? '#FF6B6B'
                                : item.sentiment === 'positive'
                                  ? '#51CF66'
                                  : '#ADB5BD',
                            borderRadius: 1,
                          },
                        }}
                      />
                    </Box>
                  ))}
                </Stack>
              </Box>

              {/* Insight */}
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor: alpha(theme.palette.info.main, 0.08),
                  border: `1px solid ${alpha(theme.palette.info.main, 0.16)}`,
                }}
              >
                <Stack direction="row" spacing={1}>
                  <Iconify
                    icon="solar:lightbulb-bolt-bold"
                    width={16}
                    sx={{ color: theme.palette.info.main, flexShrink: 0, mt: 0.25 }}
                  />
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
