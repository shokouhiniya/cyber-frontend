import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { useAiContent } from 'src/api/dashboard';

import { Iconify } from 'src/components/iconify';
import { InfoTooltip } from 'src/components/info-tooltip';
import { WIDGET_TOOLTIPS } from 'src/components/info-tooltip/widget-tooltips';

import { WhatIfChat } from './whatif-chat';

// ----------------------------------------------------------------------

const FALLBACK_RECS = [];

const typeConfig = {
  urgent: { color: '#FF6B6B', label: 'فوری', bgcolor: alpha('#FF6B6B', 0.08) },
  important: { color: '#FFA94D', label: 'مهم', bgcolor: alpha('#FFA94D', 0.08) },
  normal: { color: '#74C0FC', label: 'عادی', bgcolor: alpha('#74C0FC', 0.08) },
};

export function TabRecommendations({ loading }) {
  const theme = useTheme();
  const { data: aiData } = useAiContent('recommendations');

  const rawRecs = Array.isArray(aiData?.llm_parsed) ? aiData.llm_parsed : FALLBACK_RECS;
  const recommendations = rawRecs.map((r, i) => ({
    id: r.id || i + 1,
    type: r.type || 'normal',
    title: r.title || '',
    description: r.description || r.reason || '',
    reason: r.reason || '',
    suggestedTime: r.suggestedTime || r.suggested_time || 'این هفته',
    platform: r.platform || 'تلگرام',
    icon: r.icon || 'solar:lightbulb-bolt-bold-duotone',
  }));

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={2.5} sx={{ pb: 10 }}>
      {/* Header */}
      <Card sx={{ p: 2.5, borderRadius: 2.5, background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.12)} 0%, ${alpha(theme.palette.info.main, 0.08)} 100%)`, border: `1px solid ${alpha(theme.palette.warning.main, 0.16)}` }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ width: 48, height: 48, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.warning.main, 0.16) }}>
            <Iconify icon="solar:lightbulb-bolt-bold-duotone" width={28} sx={{ color: theme.palette.warning.main }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>پیشنهادات واکنش هوشمند</Typography>
            <InfoTooltip title={WIDGET_TOOLTIPS.recommendations} />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 11 }}>بر اساس تحلیل داده‌های لحظه‌ای و الگوهای رفتاری</Typography>
          </Box>
        </Stack>
      </Card>

      {recommendations.length === 0 ? (
        <Card sx={{ p: 4, borderRadius: 2.5, textAlign: 'center' }}>
          <Iconify icon="solar:lightbulb-bolt-bold-duotone" width={40} sx={{ color: 'text.disabled', mb: 1.5 }} />
          <Typography variant="body2" color="text.secondary">
            پیشنهادی از هوش مصنوعی دریافت نشده است.
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5 }}>
            پس از دریافت داده‌های کافی، پیشنهادات اینجا نمایش داده می‌شوند.
          </Typography>
        </Card>
      ) : (
        recommendations.map((rec) => {
        const cfg = typeConfig[rec.type] || typeConfig.normal;
        return (
          <Card key={rec.id} sx={{ borderRadius: 2.5, overflow: 'hidden', boxShadow: theme.shadows[2], border: `1px solid ${alpha(cfg.color, 0.16)}`, transition: 'all 0.3s ease', '&:hover': { boxShadow: theme.shadows[8], transform: 'translateY(-2px)' } }}>
            <Box sx={{ p: 2, bgcolor: cfg.bgcolor, borderBottom: `1px solid ${alpha(cfg.color, 0.12)}` }}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box sx={{ width: 40, height: 40, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(cfg.color, 0.16) }}>
                  <Iconify icon={rec.icon} width={24} sx={{ color: cfg.color }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: 14 }}>{rec.title}</Typography>
                </Box>
                <Chip label={cfg.label} size="small" sx={{ height: 24, fontSize: 11, fontWeight: 700, bgcolor: alpha(cfg.color, 0.16), color: cfg.color, border: `1px solid ${alpha(cfg.color, 0.24)}` }} />
              </Stack>
            </Box>

            <Box sx={{ p: 2 }}>
              <Stack spacing={2}>
                <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.7, fontSize: 13 }}>{rec.description}</Typography>

                <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: alpha(theme.palette.info.main, 0.04), border: `1px solid ${alpha(theme.palette.info.main, 0.08)}` }}>
                  <Stack direction="row" alignItems="flex-start" spacing={1}>
                    <Iconify icon="solar:info-circle-bold" width={16} sx={{ color: theme.palette.info.main, mt: 0.2 }} />
                    <Typography variant="caption" sx={{ fontSize: 11, lineHeight: 1.6 }}>
                      <strong>دلیل:</strong> {rec.reason}
                    </Typography>
                  </Stack>
                </Box>

                <Stack spacing={1}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Iconify icon="solar:clock-circle-bold" width={16} sx={{ color: 'text.secondary' }} />
                    <Typography variant="caption" sx={{ fontSize: 11 }}><strong>زمان پیشنهادی:</strong> {rec.suggestedTime}</Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Iconify icon="solar:widget-5-bold" width={16} sx={{ color: 'text.secondary' }} />
                    <Typography variant="caption" sx={{ fontSize: 11 }}><strong>پلتفرم:</strong> {rec.platform}</Typography>
                  </Stack>
                </Stack>
              </Stack>
            </Box>
          </Card>
        );
        })
      )}

      <WhatIfChat />
    </Stack>
  );
}
