'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { useAiContent } from 'src/api/dashboard';

import { Iconify } from 'src/components/iconify';
import { InfoTooltip } from 'src/components/info-tooltip';
import { WIDGET_TOOLTIPS } from 'src/components/info-tooltip/widget-tooltips';

// ----------------------------------------------------------------------

function extractText(parsed) {
  if (!parsed) return null;
  if (typeof parsed === 'string') return parsed;
  if (typeof parsed === 'object') {
    for (const key of ['summary', 'analysis', 'text', 'result', 'content', 'output']) {
      if (parsed[key] && typeof parsed[key] === 'string') return parsed[key];
    }
    const firstStr = Object.values(parsed).find((v) => typeof v === 'string');
    return firstStr || null;
  }
  return null;
}

export function AISummary({ loading, onActionClick }) {
  const theme = useTheme();
  const { data: aiData, isLoading: aiLoading } = useAiContent('ai_summary');

  const summary = extractText(aiData?.llm_parsed);

  if (loading || aiLoading) {
    return (
      <Card sx={{ p: 2.5, borderRadius: 2.5, boxShadow: theme.shadows[2], display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 100 }}>
        <CircularProgress size={24} />
      </Card>
    );
  }

  return (
    <Card
      sx={{
        position: 'relative', borderRadius: 2.5, overflow: 'hidden', boxShadow: theme.shadows[2],
        background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.08)} 100%)`,
        border: `1px solid ${alpha(theme.palette.info.main, 0.16)}`,
      }}
    >
      <Box sx={{ p: 2.5 }}>
        <Stack spacing={1.5}>
          {/* Header */}
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{ width: 36, height: 36, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`, boxShadow: `0 4px 12px ${alpha(theme.palette.info.main, 0.24)}` }}>
              <Iconify icon="solar:magic-stick-3-bold-duotone" width={20} sx={{ color: '#fff' }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>خلاصه هوش مصنوعی</Typography>
              <InfoTooltip title={WIDGET_TOOLTIPS.aiSummary} />
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 10 }}>تحلیل ۲۴ ساعت گذشته</Typography>
            </Box>
          </Stack>

          {summary ? (
            <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.8, fontSize: 13, fontWeight: 500 }}>
              {summary}
            </Typography>
          ) : (
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8, fontSize: 13 }}>
              در حال پردازش داده‌ها...
            </Typography>
          )}

          <Button
            variant="contained"
            size="small"
            startIcon={<Iconify icon="solar:lightbulb-bolt-bold-duotone" width={18} />}
            onClick={onActionClick}
            sx={{ bgcolor: theme.palette.info.main, color: '#fff', fontWeight: 700, fontSize: 12, height: 36, '&:hover': { bgcolor: theme.palette.info.dark } }}
          >
            مشاهده اقدامات پیشنهادی
          </Button>
        </Stack>
      </Box>

      <Box sx={{ position: 'absolute', top: -10, right: -10, width: 60, height: 60, borderRadius: '50%', bgcolor: alpha(theme.palette.info.main, 0.08) }} />
    </Card>
  );
}
