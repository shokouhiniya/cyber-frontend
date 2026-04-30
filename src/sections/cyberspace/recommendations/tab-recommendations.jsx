import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

import { WhatIfChat } from './whatif-chat';

// ----------------------------------------------------------------------

export function TabRecommendations({ loading }) {
  const theme = useTheme();

  const recommendations = [
    {
      id: 1,
      type: 'urgent',
      title: '\u067E\u0627\u0633\u062E \u0628\u0647 \u0627\u0646\u062A\u0642\u0627\u062F\u0627\u062A \u062C\u0628\u0647\u0647 \u067E\u0627\u06CC\u062F\u0627\u0631\u06CC',
      description:
        '\u06F7 \u0646\u0645\u0627\u06CC\u0646\u062F\u0647 \u062C\u0628\u0647\u0647 \u067E\u0627\u06CC\u062F\u0627\u0631\u06CC \u0628\u06CC\u0627\u0646\u06CC\u0647 \u0631\u0627 \u0627\u0645\u0636\u0627 \u0646\u06A9\u0631\u062F\u0646\u062F \u0648 \u0627\u06CC\u0646 \u0645\u0648\u0636\u0648\u0639 \u062F\u0631 \u062D\u0627\u0644 \u062A\u0628\u062F\u06CC\u0644 \u0634\u062F\u0646 \u0628\u0647 \u0631\u0648\u0627\u06CC\u062A \u063A\u0627\u0644\u0628 \u0627\u0633\u062A. \u067E\u06CC\u0634\u0646\u0647\u0627\u062F \u0645\u06CC\u200C\u0634\u0648\u062F \u0628\u0627 \u0627\u0646\u062A\u0634\u0627\u0631 \u0628\u06CC\u0627\u0646\u06CC\u0647 \u062A\u06A9\u0645\u06CC\u0644\u06CC \u0628\u0631 \u0648\u062D\u062F\u062A \u062A\u0623\u06A9\u06CC\u062F \u0634\u0648\u062F.',
      reason: '\u06F4\u06F2\u066A \u0628\u062D\u062B\u200C\u0647\u0627 \u062D\u0648\u0644 \u062E\u0637\u0648\u0637 \u0642\u0631\u0645\u0632 \u0648 \u0639\u062F\u0645 \u0627\u0645\u0636\u0627\u06CC \u06F7 \u0646\u0641\u0631',
      suggestedTime: '\u0627\u0645\u0631\u0648\u0632 \u06F2\u06F0:\u06F0\u06F0',
      platform: '\u062A\u0644\u06AF\u0631\u0627\u0645 \u0648 \u0628\u0644\u0647',
      icon: 'solar:danger-triangle-bold-duotone',
    },
    {
      id: 2,
      type: 'urgent',
      title: '\u0645\u062F\u06CC\u0631\u06CC\u062A \u0631\u0648\u0627\u06CC\u062A \u0642\u06CC\u0645\u062A \u0646\u0641\u062A',
      description:
        '\u0627\u0638\u0647\u0627\u0631\u0627\u062A \u0642\u0627\u0644\u06CC\u0628\u0627\u0641 \u062F\u0631\u0628\u0627\u0631\u0647 \u06F1\u06F2\u06F0 \u062F\u0644\u0627\u0631\u06CC \u0634\u062F\u0646 \u0646\u0641\u062A \u062F\u0631 \u062D\u0627\u0644 \u0648\u0627\u06CC\u0631\u0627\u0644 \u0634\u062F\u0646 \u0627\u0633\u062A. \u0646\u06CC\u0627\u0632 \u0628\u0647 \u062A\u0648\u0636\u06CC\u062D \u062F\u0642\u06CC\u0642\u200C\u062A\u0631 \u0627\u0633\u062A.',
      reason: '\u06F1\u06F8\u066A \u0627\u0641\u0632\u0627\u06CC\u0634 \u0628\u062D\u062B \u062F\u0631\u0628\u0627\u0631\u0647 \u0642\u06CC\u0645\u062A \u0646\u0641\u062A',
      suggestedTime: '\u0627\u0645\u0631\u0648\u0632 \u06F1\u06F8:\u06F0\u06F0',
      platform: '\u0631\u0648\u0628\u06CC\u06A9\u0627 \u0648 \u0627\u06CC\u062A\u0627',
      icon: 'solar:fire-bold-duotone',
    },
    {
      id: 3,
      type: 'important',
      title: '\u062A\u0642\u0648\u06CC\u062A \u0631\u0648\u0627\u06CC\u062A \u0645\u06CC\u0644\u0627\u062F \u0627\u0645\u0627\u0645 \u0631\u0636\u0627',
      description:
        '\u062F\u0644\u0646\u0648\u0634\u062A\u0647 \u0642\u0627\u0644\u06CC\u0628\u0627\u0641 \u062F\u0631 \u0634\u0628 \u0645\u06CC\u0644\u0627\u062F \u0627\u0645\u0627\u0645 \u0631\u0636\u0627 \u0628\u0627\u0632\u062E\u0648\u0631\u062F \u0645\u062B\u0628\u062A\u06CC \u062F\u0627\u0634\u062A\u0647. \u0627\u062F\u0627\u0645\u0647 \u0627\u06CC\u0646 \u0631\u0648\u06CC\u06A9\u0631\u062F \u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u062F \u0627\u062D\u0633\u0627\u0633\u0627\u062A \u0645\u062B\u0628\u062A \u0631\u0627 \u062A\u0642\u0648\u06CC\u062A \u06A9\u0646\u062F.',
      reason: '\u06F6\u06F9 \u067E\u0633\u062A \u0645\u062B\u0628\u062A \u062F\u0631\u0628\u0627\u0631\u0647 \u0627\u0645\u0627\u0645 \u0631\u0636\u0627 \u0648 \u0631\u0647\u0628\u0631 \u0634\u0647\u06CC\u062F',
      suggestedTime: '\u0641\u0631\u062F\u0627 \u06F1\u06F0:\u06F0\u06F0',
      platform: '\u0647\u0645\u0647 \u067E\u0644\u062A\u0641\u0631\u0645\u200C\u0647\u0627',
      icon: 'solar:star-shine-bold-duotone',
    },
    {
      id: 4,
      type: 'normal',
      title: '\u067E\u0627\u0633\u062E \u0628\u0647 \u0631\u0648\u0627\u06CC\u062A \u062C\u0646\u06AF \u062A\u0631\u06A9\u06CC\u0628\u06CC',
      description:
        '\u06F2\u06F0 \u067E\u0633\u062A \u062F\u0631\u0628\u0627\u0631\u0647 \u062C\u0646\u06AF \u062A\u0631\u06A9\u06CC\u0628\u06CC \u062F\u0634\u0645\u0646 \u0645\u0646\u062A\u0634\u0631 \u0634\u062F\u0647. \u0627\u0646\u062A\u0634\u0627\u0631 \u0645\u062D\u062A\u0648\u0627\u06CC \u062A\u0648\u0636\u06CC\u062D\u06CC \u062F\u0631\u0628\u0627\u0631\u0647 \u0627\u0642\u062F\u0627\u0645\u0627\u062A \u0627\u0646\u062C\u0627\u0645\u200C\u0634\u062F\u0647 \u067E\u06CC\u0634\u0646\u0647\u0627\u062F \u0645\u06CC\u200C\u0634\u0648\u062F.',
      reason: '\u06F1\u06F9 \u067E\u0633\u062A \u0628\u0627 \u0645\u0648\u0636\u0648\u0639 \u062C\u0646\u06AF \u062A\u0631\u06A9\u06CC\u0628\u06CC \u062F\u0631 \u06F2\u06F4 \u0633\u0627\u0639\u062A \u06AF\u0630\u0634\u062A\u0647',
      suggestedTime: '\u0627\u06CC\u0646 \u0647\u0641\u062A\u0647',
      platform: '\u062A\u0644\u06AF\u0631\u0627\u0645',
      icon: 'solar:shield-warning-bold-duotone',
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

      {/* What-If Scenario Chatbot */}
      <WhatIfChat />
    </Stack>
  );
}
