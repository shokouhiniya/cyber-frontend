import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const POSITIVE_COLOR = '#51CF66';
const NEGATIVE_COLOR = '#FF6B6B';

const BRACKETS = [
  { label: 'برانداز سخت', positive: 120, negative: 340 },
  { label: 'برانداز نرم', positive: 280, negative: 190 },
  { label: 'اصلاح‌طلب', positive: 410, negative: 150 },
  { label: 'اصولگرا', positive: 520, negative: 95 },
];

export function PoliticalSpectrum({ loading }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (loading) {
    return (
      <Card sx={{ p: 2, borderRadius: 2, boxShadow: theme.shadows[2] }}>
        <CircularProgress size={24} />
      </Card>
    );
  }

  const maxVal = Math.max(...BRACKETS.flatMap((b) => [b.positive, b.negative]));

  return (
    <Card sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: theme.shadows[2] }}>
      <Box sx={{ p: 2 }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2.5 }}>
          <Iconify icon="solar:scale-bold-duotone" width={20} sx={{ color: theme.palette.primary.main }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>طیف سیاسی</Typography>
        </Stack>

        {/* Chart area */}
        <Box sx={{ px: 1 }}>
          {/* Positive bars (above the line) */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end', height: 80, mb: 0 }}>
            {BRACKETS.map((b) => {
              const h = maxVal > 0 ? (b.positive / maxVal) * 100 : 0;
              return (
                <Box key={`pos-${b.label}`} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                  <Typography variant="caption" sx={{ fontSize: 9, fontWeight: 700, color: POSITIVE_COLOR, mb: 0.5 }}>
                    {b.positive.toLocaleString('fa-IR')}
                  </Typography>
                  <Box
                    sx={{
                      width: '70%',
                      height: `${h}%`,
                      minHeight: 4,
                      bgcolor: alpha(POSITIVE_COLOR, isDark ? 0.6 : 0.7),
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.5s ease',
                      boxShadow: `0 -2px 8px ${alpha(POSITIVE_COLOR, 0.3)}`,
                    }}
                  />
                </Box>
              );
            })}
          </Box>

          {/* Center line */}
          <Box sx={{ height: 2, bgcolor: alpha(theme.palette.grey[500], 0.3), borderRadius: 1, mx: -0.5 }} />

          {/* Negative bars (below the line) */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', height: 80, mt: 0 }}>
            {BRACKETS.map((b) => {
              const h = maxVal > 0 ? (b.negative / maxVal) * 100 : 0;
              return (
                <Box key={`neg-${b.label}`} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', height: '100%' }}>
                  <Box
                    sx={{
                      width: '70%',
                      height: `${h}%`,
                      minHeight: 4,
                      bgcolor: alpha(NEGATIVE_COLOR, isDark ? 0.6 : 0.7),
                      borderRadius: '0 0 4px 4px',
                      transition: 'height 0.5s ease',
                      boxShadow: `0 2px 8px ${alpha(NEGATIVE_COLOR, 0.3)}`,
                    }}
                  />
                  <Typography variant="caption" sx={{ fontSize: 9, fontWeight: 700, color: NEGATIVE_COLOR, mt: 0.5 }}>
                    {b.negative.toLocaleString('fa-IR')}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          {/* Labels */}
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            {BRACKETS.map((b) => (
              <Box key={`lbl-${b.label}`} sx={{ flex: 1, textAlign: 'center' }}>
                <Typography variant="caption" sx={{ fontSize: 9, fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>
                  {b.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Legend */}
        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: POSITIVE_COLOR }} />
            <Typography variant="caption" sx={{ fontSize: 10 }}>حجم مثبت</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: NEGATIVE_COLOR }} />
            <Typography variant="caption" sx={{ fontSize: 10 }}>حجم منفی</Typography>
          </Stack>
        </Stack>
      </Box>
    </Card>
  );
}
