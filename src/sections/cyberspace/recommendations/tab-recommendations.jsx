import { useState } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { fNum } from 'src/utils/format-number-fa';

import { useAiContent } from 'src/api/dashboard';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { WIDGET_TOOLTIPS } from 'src/components/info-tooltip/widget-tooltips';

import { WidgetCard } from '../shared/widget-card';
import { PageHeader } from '../shared/page-header';
import { GridItem, WidgetGrid } from '../shared/widget-grid';

// ----------------------------------------------------------------------

const FALLBACK_RECS = [];

const TYPE_CONFIG = {
  urgent: { color: 'error', label: 'فوری', icon: 'solar:danger-triangle-bold', order: 0 },
  important: { color: 'warning', label: 'مهم', icon: 'solar:flag-bold', order: 1 },
  normal: { color: 'info', label: 'عادی', icon: 'solar:info-circle-bold', order: 2 },
};

const PLATFORM_ICONS = {
  تلگرام: 'ic:baseline-telegram',
  telegram: 'ic:baseline-telegram',
  ایکس: 'ri:twitter-x-fill',
  توییتر: 'ri:twitter-x-fill',
  twitter: 'ri:twitter-x-fill',
  x: 'ri:twitter-x-fill',
  اینستاگرام: 'mdi:instagram',
  instagram: 'mdi:instagram',
};

function normalize(r, i) {
  const description = r.description || r.reason || '';
  const reason = r.reason || '';
  return {
    id: r.id || i + 1,
    type: TYPE_CONFIG[r.type] ? r.type : 'normal',
    title: r.title || '',
    description,
    // Don't repeat the reason when the description already fell back to it
    reason: reason && reason !== description ? reason : '',
    suggestedTime: r.suggestedTime || r.suggested_time || '',
    platform: r.platform || '',
    icon: r.icon || 'solar:lightbulb-bolt-bold-duotone',
  };
}

export function TabRecommendations({ loading }) {
  const { data: aiData, isLoading } = useAiContent('recommendations');

  const rawRecs = Array.isArray(aiData?.llm_parsed) ? aiData.llm_parsed : FALLBACK_RECS;
  const recommendations = rawRecs
    .map(normalize)
    .sort((a, b) => TYPE_CONFIG[a.type].order - TYPE_CONFIG[b.type].order);

  const counts = recommendations.reduce((acc, r) => ({ ...acc, [r.type]: (acc[r.type] || 0) + 1 }), {});
  const summary = Object.keys(TYPE_CONFIG)
    .filter((key) => counts[key])
    .map((key) => `${fNum(counts[key])} ${TYPE_CONFIG[key].label}`)
    .join(' · ');

  return (
    <>
      <PageHeader
        title="پیشنهادات واکنش هوشمند"
        description="پیشنهادهای عملیاتی بر اساس تحلیل داده‌های لحظه‌ای و الگوهای رفتاری، به ترتیب اولویت."
      />

      <WidgetGrid sx={{ pb: { xs: 10, lg: 4 } }}>
        {/* The what-if scenario chat (whatif-chat.jsx) is held back for the next phase */}
        <GridItem>
          <WidgetCard
            title="پیشنهادهای امروز"
            icon="solar:lightbulb-bolt-bold-duotone"
            color="warning"
            tooltip={WIDGET_TOOLTIPS.recommendations}
            subheader={recommendations.length ? `${fNum(recommendations.length)} پیشنهاد · ${summary}` : undefined}
            loading={loading || isLoading}
            loadingHeight={320}
            empty={!recommendations.length}
            emptyIcon="solar:lightbulb-bolt-bold-duotone"
            emptyText="پیشنهادی از هوش مصنوعی دریافت نشده است. پس از دریافت داده‌های کافی، پیشنهادها اینجا نمایش داده می‌شوند."
          >
            <Stack spacing={1.5}>
              {recommendations.map((rec, index) => (
                <RecommendationItem key={rec.id} rec={rec} index={index} />
              ))}
            </Stack>
          </WidgetCard>
        </GridItem>
      </WidgetGrid>
    </>
  );
}

// ----------------------------------------------------------------------

function MetaChip({ icon, label }) {
  const theme = useTheme();
  return (
    <Chip
      size="small"
      variant="outlined"
      icon={<Iconify icon={icon} width={16} />}
      label={label}
      sx={{
        height: 26,
        fontSize: 12,
        color: 'text.secondary',
        borderColor: alpha(theme.palette.grey[500], 0.24),
        '& .MuiChip-icon': { color: 'text.secondary', mx: 0.5 },
      }}
    />
  );
}

function RecommendationItem({ rec, index }) {
  const theme = useTheme();
  const cfg = TYPE_CONFIG[rec.type];
  const tone = theme.palette[cfg.color].main;
  const [expanded, setExpanded] = useState(rec.type === 'urgent');

  const handleCopy = async () => {
    const text = [rec.title, rec.description, rec.reason && `دلیل: ${rec.reason}`].filter(Boolean).join('\n\n');
    try {
      await navigator.clipboard.writeText(text);
      toast.success('متن پیشنهاد کپی شد.');
    } catch {
      toast.error('کپی متن ممکن نشد.');
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        p: { xs: 2, sm: 2.25 },
        borderRadius: 1.5,
        border: `1px solid ${alpha(theme.palette.grey[500], 0.16)}`,
        borderInlineStart: `4px solid ${tone}`,
        bgcolor: rec.type === 'urgent' ? alpha(tone, 0.04) : 'transparent',
      }}
    >
      <Stack direction="row" alignItems="flex-start" spacing={1.5}>
        <Box
          sx={{
            width: 40,
            height: 40,
            flexShrink: 0,
            borderRadius: 1.25,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: tone,
            bgcolor: alpha(tone, 0.12),
          }}
        >
          <Iconify icon={rec.icon} width={22} />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1} sx={{ mb: 0.75 }}>
            <Chip
              size="small"
              icon={<Iconify icon={cfg.icon} width={14} />}
              label={`اولویت ${cfg.label}`}
              sx={{
                height: 24,
                fontSize: 12,
                fontWeight: 700,
                color: tone,
                bgcolor: alpha(tone, 0.12),
                '& .MuiChip-icon': { color: tone, mx: 0.5 },
              }}
            />
            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600 }}>
              پیشنهاد {fNum(index + 1)}
            </Typography>
          </Stack>

          <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.6 }}>
            {rec.title || 'پیشنهاد بدون عنوان'}
          </Typography>

          {rec.description && (
            <Typography
              variant="body2"
              sx={{
                mt: 0.75,
                color: 'text.secondary',
                lineHeight: 1.9,
                ...(!expanded && {
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }),
              }}
            >
              {rec.description}
            </Typography>
          )}

          {expanded && rec.reason && (
            <Stack
              direction="row"
              alignItems="flex-start"
              spacing={1}
              sx={{
                mt: 1.5,
                p: 1.5,
                borderRadius: 1.25,
                bgcolor: alpha(theme.palette.info.main, 0.08),
              }}
            >
              <Iconify icon="solar:info-circle-bold" width={18} sx={{ color: 'info.main', flexShrink: 0, mt: 0.25 }} />
              <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                <Box component="strong" sx={{ fontWeight: 700 }}>
                  دلیل:{' '}
                </Box>
                {rec.reason}
              </Typography>
            </Stack>
          )}

          {(rec.suggestedTime || rec.platform) && (
            <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1.5 }}>
              {rec.suggestedTime && <MetaChip icon="solar:clock-circle-bold" label={`زمان: ${rec.suggestedTime}`} />}
              {rec.platform && (
                <MetaChip
                  icon={PLATFORM_ICONS[rec.platform.toLowerCase?.() ?? rec.platform] || 'solar:widget-5-bold'}
                  label={rec.platform}
                />
              )}
            </Stack>
          )}

          <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1.75 }}>
            {(rec.reason || rec.description.length > 160) && (
              <Button
                size="small"
                color="inherit"
                onClick={() => setExpanded((v) => !v)}
                endIcon={<Iconify icon={expanded ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'} />}
              >
                {expanded ? 'بستن جزئیات' : 'جزئیات و دلیل'}
              </Button>
            )}
            <Button
              size="small"
              color="inherit"
              onClick={handleCopy}
              startIcon={<Iconify icon="solar:copy-bold" width={16} />}
            >
              کپی متن
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
