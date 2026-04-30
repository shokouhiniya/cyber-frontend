import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const CONTEXT_ITEMS = [
  {
    text: '\u0628\u06CC\u0627\u0646\u06CC\u0647 \u06F2\u06F6\u06F1 \u0646\u0645\u0627\u06CC\u0646\u062F\u0647 \u0645\u062C\u0644\u0633 \u062F\u0631 \u062D\u0645\u0627\u06CC\u062A \u0627\u0632 \u0642\u0627\u0644\u06CC\u0628\u0627\u0641 \u0648 \u0647\u06CC\u0626\u062A \u0645\u0630\u0627\u06A9\u0631\u0647\u200C\u06A9\u0646\u0646\u062F\u0647\u061B \u0641\u0636\u0627\u06CC \u0633\u06CC\u0627\u0633\u06CC \u0628\u0647 \u0634\u062F\u062A \u0642\u0637\u0628\u06CC \u0634\u062F\u0647',
    icon: 'solar:flag-bold',
    severity: 'high',
  },
  {
    text: '\u062C\u0628\u0647\u0647 \u067E\u0627\u06CC\u062F\u0627\u0631\u06CC \u0628\u0627 \u06F7 \u0646\u0645\u0627\u06CC\u0646\u062F\u0647 \u0627\u0632 \u0627\u0645\u0636\u0627 \u062E\u0648\u062F\u062F\u0627\u0631\u06CC \u06A9\u0631\u062F\u0647\u061B \u0634\u06A9\u0627\u0641 \u062F\u0631\u0648\u0646 \u062C\u0631\u06CC\u0627\u0646 \u0627\u0635\u0648\u0644\u06AF\u0631\u0627 \u0622\u0634\u06A9\u0627\u0631 \u0634\u062F\u0647',
    icon: 'solar:danger-triangle-bold',
    severity: 'high',
  },
  {
    text: '\u0645\u0648\u0636\u0648\u0639 \u0645\u0630\u0627\u06A9\u0631\u0627\u062A \u0647\u0633\u062A\u0647\u200C\u0627\u06CC \u0648 \u0642\u06CC\u0645\u062A \u0646\u0641\u062A \u062F\u0631 \u0635\u062F\u0631 \u0628\u062D\u062B\u200C\u0647\u0627\u06CC \u0631\u0633\u0627\u0646\u0647\u200C\u0627\u06CC \u0642\u0631\u0627\u0631 \u062F\u0627\u0631\u062F',
    icon: 'solar:shield-warning-bold',
    severity: 'medium',
  },
  {
    text: '\u0641\u0636\u0627\u06CC \u0645\u062C\u0627\u0632\u06CC \u062F\u0627\u062E\u0644\u06CC (\u0628\u0644\u0647\u060C \u0631\u0648\u0628\u06CC\u06A9\u0627\u060C \u0627\u06CC\u062A\u0627) \u0628\u06CC\u0634\u062A\u0631\u06CC\u0646 \u062D\u062C\u0645 \u0627\u0646\u062A\u0634\u0627\u0631 \u0631\u0627 \u062F\u0627\u0631\u062F \u2014 \u062A\u0644\u06AF\u0631\u0627\u0645 \u0628\u0627 \u06F6\u06F5M \u0628\u0627\u0632\u062F\u06CC\u062F \u067E\u06CC\u0634\u062A\u0627\u0632 \u0627\u0633\u062A',
    icon: 'solar:graph-up-bold',
    severity: 'medium',
  },
  {
    text: '\u0645\u06CC\u0644\u0627\u062F \u0627\u0645\u0627\u0645 \u0631\u0636\u0627 (\u0639) \u0641\u0631\u0635\u062A \u0631\u0648\u0627\u06CC\u062A\u200C\u0633\u0627\u0632\u06CC \u0645\u062B\u0628\u062A \u0628\u0631\u0627\u06CC \u0642\u0627\u0644\u06CC\u0628\u0627\u0641 \u0627\u06CC\u062C\u0627\u062F \u06A9\u0631\u062F\u0647',
    icon: 'solar:star-bold',
    severity: 'low',
  },
];

const SEVERITY_CONFIG = {
  high: { color: '#FF6B6B', label: 'حساس' },
  medium: { color: '#FFA94D', label: 'قابل توجه' },
  low: { color: '#51CF66', label: 'فرصت' },
};

export function MacroContext() {
  const theme = useTheme();

  return (
    <Card sx={{ borderRadius: 2.5, overflow: 'hidden', boxShadow: theme.shadows[2] }}>
      <Box
        sx={{
          p: 2.5,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.warning.main, 0.08)} 100%)`,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ width: 40, height: 40, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.primary.main, 0.16) }}>
            <Iconify icon="solar:globe-bold-duotone" width={24} sx={{ color: theme.palette.primary.main }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>وضعیت کلان</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              بستر سیاسی-اجتماعی حاکم بر فضای رصد
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ p: 2 }}>
        <Stack spacing={1.25}>
          {CONTEXT_ITEMS.map((item, i) => {
            const sev = SEVERITY_CONFIG[item.severity];
            return (
              <Stack
                key={i}
                direction="row"
                alignItems="flex-start"
                spacing={1.5}
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor: alpha(sev.color, 0.04),
                  border: `1px solid ${alpha(sev.color, 0.12)}`,
                  borderRight: `3px solid ${sev.color}`,
                }}
              >
                <Iconify icon={item.icon} width={18} sx={{ color: sev.color, mt: 0.25, flexShrink: 0 }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="caption" sx={{ fontSize: 11, lineHeight: 1.7, color: 'text.primary' }}>
                    {item.text}
                  </Typography>
                </Box>
                <Chip
                  label={sev.label}
                  size="small"
                  sx={{
                    height: 20, fontSize: 8, fontWeight: 700, flexShrink: 0,
                    bgcolor: alpha(sev.color, 0.1),
                    color: sev.color,
                  }}
                />
              </Stack>
            );
          })}
        </Stack>
      </Box>
    </Card>
  );
}
