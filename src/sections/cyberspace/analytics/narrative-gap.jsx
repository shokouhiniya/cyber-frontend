import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';

import { useAiContent } from 'src/api/dashboard';

import { Iconify } from 'src/components/iconify';
import { InfoTooltip } from 'src/components/info-tooltip';
import { WIDGET_TOOLTIPS } from 'src/components/info-tooltip/widget-tooltips';

// ----------------------------------------------------------------------

// Hardcoded narrative data removed — will be populated from AI (narrative_gap prompt).
// The component merges LLM output when available.
const narratives = [];

const PLATFORM_ICONS = {
  'توییتر': 'ri:twitter-x-fill',
  'تلگرام': 'ic:baseline-telegram',
  'اینستاگرام': 'mdi:instagram',
  'خبرگزاری': 'solar:document-text-bold',
};

export function NarrativeGap({ loading }) {
  const theme = useTheme();
  const [openTrace, setOpenTrace] = useState(null);
  const { data: aiData } = useAiContent('narrative_gap');

  // Merge LLM data into the narratives array if available
  const parsed = aiData?.llm_parsed;
  const activeNarratives = [...narratives];
  if (parsed && typeof parsed === 'object' && parsed.official) {
    activeNarratives[0] = {
      official: parsed.official,
      officialPercent: parsed.officialPercent ?? 0,
      gapLevel: parsed.gapLevel || 'medium',
      public: Array.isArray(parsed.public) ? parsed.public.map((p) => ({
        topic: p.topic,
        percent: p.percent,
        sentiment: p.sentiment || 'negative',
        traces: [],
      })) : [],
    };
  }

  const toggleTrace = (key) => setOpenTrace((prev) => (prev === key ? null : key));

  const getGapColor = (level) => {
    switch (level) {
      case 'high':   return { color: '#FF6B6B', label: 'شکاف بالا',   icon: 'solar:danger-triangle-bold' };
      case 'medium': return { color: '#FFA94D', label: 'شکاف متوسط', icon: 'solar:info-circle-bold' };
      default:       return { color: '#51CF66', label: 'هم‌راستا',    icon: 'solar:check-circle-bold' };
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

  const FALLBACK_NARRATIVE = null;

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
            <InfoTooltip title={WIDGET_TOOLTIPS.narrativeGap} />
          </Box>
        </Stack>
      </Box>

      <Box sx={{ p: 2 }}>
        {activeNarratives.length === 0 ? (
          <Box sx={{ py: 3, textAlign: 'center' }}>
            <Iconify icon="solar:soundwave-bold-duotone" width={36} sx={{ color: 'text.disabled', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">تحلیل شکاف روایت در دسترس نیست.</Typography>
          </Box>
        ) : (
          activeNarratives.map((narrative, nIdx) => {
          const gap = getGapColor(narrative.gapLevel);
          return (
            <Stack key={nIdx} spacing={2}>
              <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: alpha(gap.color, 0.08), border: `1px solid ${alpha(gap.color, 0.24)}` }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify icon={gap.icon} width={20} sx={{ color: gap.color }} />
                  <Typography variant="body2" sx={{ fontWeight: 700, color: gap.color, fontSize: 12 }}>{gap.label}</Typography>
                </Stack>
              </Box>

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
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 600, fontSize: 11 }}>{item.topic}</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 11, color: sentColor }}>{item.percent}%</Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={item.percent}
                          sx={{ height: 6, borderRadius: 1, bgcolor: alpha(theme.palette.grey[500], 0.08), '& .MuiLinearProgress-bar': { bgcolor: sentColor, borderRadius: 1 } }}
                        />
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
            </Stack>
          );
        })
        )}
      </Box>
    </Card>
  );
}
