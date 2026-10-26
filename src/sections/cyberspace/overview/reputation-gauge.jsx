import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { fNum } from 'src/utils/format-number-fa';

import { Iconify } from 'src/components/iconify';
import { WIDGET_TOOLTIPS } from 'src/components/info-tooltip/widget-tooltips';

import { WidgetCard } from '../shared/widget-card';

// ----------------------------------------------------------------------

// Bands shown under the gauge, so the reader can see where the cut-offs are
const BANDS = [
  { from: 0, to: 45, label: 'نامطلوب', color: 'error' },
  { from: 45, to: 65, label: 'متوسط', color: 'warning' },
  { from: 65, to: 100, label: 'مطلوب', color: 'success' },
];

const getBand = (score) => BANDS.find((b) => score < b.to) ?? BANDS[BANDS.length - 1];

const BAND_ICON = {
  error: 'solar:shield-cross-bold-duotone',
  warning: 'solar:shield-warning-bold-duotone',
  success: 'solar:shield-check-bold-duotone',
};

// Score = 50 + (positive − negative) ÷ total × 50, computed in OverviewView.
export function ReputationGauge({ loading, healthScore = null }) {
  const theme = useTheme();

  const hasScore = healthScore !== null && healthScore !== undefined;
  const score = hasScore ? healthScore : 0;
  const band = getBand(score);
  const tone = theme.palette[band.color].main;

  // 240° arc gauge
  const size = 180;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const arc = circumference * (240 / 360);
  const filled = hasScore ? arc * (score / 100) : 0;

  return (
    <WidgetCard
      title="شاخص سلامت اعتبار"
      icon={BAND_ICON[band.color]}
      color={hasScore ? band.color : 'primary'}
      tooltip={WIDGET_TOOLTIPS.reputationGauge}
      subheader="تراز احساسات مثبت و منفی، از ۰ تا ۱۰۰"
      loading={loading}
      loadingHeight={220}
      empty={!loading && !hasScore}
      emptyText="هنوز پست تحلیل‌شده‌ای برای محاسبه شاخص وجود ندارد."
    >
      <Stack alignItems="center" spacing={2}>
        <Box sx={{ position: 'relative', width: size, height: size * 0.82 }}>
          <svg width={size} height={size} style={{ transform: 'scaleX(-1) rotate(150deg)' }} aria-hidden>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={alpha(theme.palette.grey[500], 0.16)}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${arc} ${circumference}`}
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={tone}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${filled} ${circumference}`}
              style={{ transition: 'stroke-dasharray 0.8s ease' }}
            />
          </svg>
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              pb: 2,
            }}
          >
            <Typography sx={{ fontSize: 44, fontWeight: 800, lineHeight: 1, color: tone }}>
              {fNum(score)}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }}>
              از ۱۰۰
            </Typography>
          </Box>
        </Box>

        <Stack
          direction="row"
          alignItems="center"
          spacing={0.75}
          sx={{
            px: 1.5,
            py: 0.75,
            borderRadius: 1,
            color: theme.palette[band.color].dark,
            bgcolor: alpha(tone, 0.12),
            ...theme.applyStyles('dark', { color: theme.palette[band.color].light }),
          }}
        >
          <Iconify icon={BAND_ICON[band.color]} width={18} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            وضعیت: {band.label}
          </Typography>
        </Stack>

        {/* Scale legend */}
        <Stack direction="row" sx={{ width: '100%', gap: 0.5 }}>
          {BANDS.map((b) => (
            <Box key={b.label} sx={{ flex: b.to - b.from, minWidth: 0 }}>
              <Box
                sx={{
                  height: 6,
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette[b.color].main, b === band ? 0.9 : 0.25),
                }}
              />
              <Typography
                variant="caption"
                component="div"
                noWrap
                sx={{ mt: 0.5, fontSize: 12, color: b === band ? 'text.primary' : 'text.secondary', fontWeight: b === band ? 700 : 400 }}
              >
                {b.label}
              </Typography>
              <Typography variant="caption" component="div" noWrap sx={{ fontSize: 11, color: 'text.disabled' }}>
                {fNum(b.from)} تا {fNum(b.to)}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Stack>
    </WidgetCard>
  );
}
