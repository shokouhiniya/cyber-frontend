'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { useAiContent } from 'src/api/dashboard';

import { Iconify } from 'src/components/iconify';
import { WIDGET_TOOLTIPS } from 'src/components/info-tooltip/widget-tooltips';

import { WidgetCard } from '../shared/widget-card';

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

  return (
    <WidgetCard
      title="خلاصه هوش مصنوعی"
      icon="solar:magic-stick-3-bold-duotone"
      color="info"
      tooltip={WIDGET_TOOLTIPS.aiSummary}
      subheader="بر اساس نمونه‌ای از پست‌های آخرین جمع‌آوری (بدون صفحات رسمی)"
      loading={loading || aiLoading}
      empty={!loading && !aiLoading && !summary}
      emptyIcon="solar:magic-stick-3-bold-duotone"
      emptyText="خلاصه هنوز آماده نیست. پس از جمع‌آوری بعدی ساخته می‌شود."
      sx={{
        background: `linear-gradient(160deg, ${alpha(theme.palette.info.main, 0.06)} 0%, transparent 55%)`,
      }}
      contentSx={{ display: 'flex', flexDirection: 'column' }}
    >
      <Typography
        variant="body1"
        sx={{ color: 'text.primary', lineHeight: 2, fontSize: { xs: 14, md: 15 }, textAlign: 'justify', flex: 1 }}
      >
        {summary}
      </Typography>

      <Box sx={{ mt: 2.5 }}>
        <Button
          variant="soft"
          color="info"
          endIcon={<Iconify icon="solar:arrow-left-linear" width={18} />}
          startIcon={<Iconify icon="solar:lightbulb-bolt-bold-duotone" width={18} />}
          onClick={onActionClick}
          sx={{ fontWeight: 700 }}
        >
          مشاهده اقدامات پیشنهادی
        </Button>
      </Box>
    </WidgetCard>
  );
}
