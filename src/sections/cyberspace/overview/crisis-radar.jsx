import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { fNum } from 'src/utils/format-number-fa';

import { useCrisisMetrics } from 'src/api/dashboard';

import { WIDGET_TOOLTIPS } from 'src/components/info-tooltip/widget-tooltips';

import { WidgetCard } from '../shared/widget-card';

// ----------------------------------------------------------------------

const CRISIS_LEVELS = {
  safe: { color: 'success', label: 'ایمن', icon: 'solar:shield-check-bold-duotone' },
  warning: { color: 'warning', label: 'هشدار', icon: 'solar:shield-warning-bold-duotone' },
  critical: { color: 'error', label: 'بحرانی', icon: 'solar:danger-triangle-bold-duotone' },
};

// ── Radar chart ───────────────────────────────────────────────────────────────

function RadarChart({ dimensions, color }) {
  const theme = useTheme();

  const cx = 120;
  const cy = 112;
  const R = 82;
  const angleStep = (2 * Math.PI) / dimensions.length;
  const grid = alpha(theme.palette.grey[500], 0.24);

  const toXY = (i, r) => {
    const angle = i * angleStep - Math.PI / 2;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  const pts = (arr) => arr.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const ring = (s) => pts(dimensions.map((_, i) => toXY(i, R * s)));
  const dataPts = dimensions.map((d, i) => toXY(i, (d.value / 100) * R));

  return (
    <Box component="svg" viewBox="0 0 240 228" sx={{ width: '100%', maxWidth: 260, height: 'auto', display: 'block', mx: 'auto' }}>
      {/* Grid rings at 25 / 50 / 75 / 100 — 50 is "normal" */}
      {[0.25, 0.5, 0.75, 1].map((s) => (
        <polygon
          key={s}
          points={ring(s)}
          fill="none"
          stroke={grid}
          strokeWidth={s === 0.5 ? 1.25 : 1}
          strokeDasharray={s === 0.5 ? '4 3' : undefined}
        />
      ))}

      {dimensions.map((_, i) => {
        const p = toXY(i, R);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={grid} strokeWidth="1" />;
      })}

      <polygon points={pts(dataPts)} fill={alpha(color, 0.2)} stroke={color} strokeWidth="2" strokeLinejoin="round" />

      {dataPts.map((p, i) =>
        dimensions[i].hasData === false ? null : (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill={color} stroke={theme.vars.palette.background.paper} strokeWidth="2" />
        )
      )}

      {/* Axis numbers — matched to the numbered list under the chart */}
      {dimensions.map((d, i) => {
        const { x, y } = toXY(i, R + 15);
        return (
          <g key={d.key}>
            <circle cx={x} cy={y} r="9" fill={alpha(theme.palette.grey[500], 0.14)} />
            <text
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="11"
              fontWeight="700"
              fill={d.hasData === false ? theme.vars.palette.text.disabled : theme.vars.palette.text.primary}
            >
              {fNum(i + 1)}
            </text>
          </g>
        );
      })}
    </Box>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function CrisisRadar({ loading: parentLoading }) {
  const theme = useTheme();
  const { data, isLoading } = useCrisisMetrics();

  const level = data?.level || 'safe';
  const score = data?.score ?? 0;
  const dims = data?.dimensions || [];
  const crisis = CRISIS_LEVELS[level] || CRISIS_LEVELS.safe;
  const tone = theme.palette[crisis.color].main;

  return (
    <WidgetCard
      title="رادار بحران"
      icon={crisis.icon}
      color={crisis.color}
      tooltip={WIDGET_TOOLTIPS.crisisRadar}
      subheader="مقایسه ۷ روز اخیر با میانگین همیشگی · ۵۰ = عادی"
      loading={parentLoading || isLoading}
      empty={!dims.length}
      emptyText="داده کافی برای محاسبه رادار وجود ندارد."
      action={
        <Box
          sx={{
            px: 1.25,
            py: 0.5,
            borderRadius: 1,
            bgcolor: alpha(tone, 0.12),
            color: theme.palette[crisis.color].dark,
            ...theme.applyStyles('dark', { color: theme.palette[crisis.color].light }),
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 12 }}>
            {crisis.label} · {fNum(score)}
          </Typography>
        </Box>
      }
      sx={
        level === 'critical'
          ? {
              borderColor: alpha(tone, 0.5),
              animation: 'crisis-pulse 2s infinite',
              '@keyframes crisis-pulse': {
                '0%, 100%': { borderColor: alpha(tone, 0.3) },
                '50%': { borderColor: alpha(tone, 0.8) },
              },
            }
          : undefined
      }
    >
      <RadarChart dimensions={dims} color={tone} />

      {/* Axis values — the radar shows the shape, this list gives the numbers */}
      <Stack spacing={1} sx={{ mt: 1.5 }}>
        {dims.map((d, i) => {
          const noData = d.hasData === false;
          const above = !noData && d.value > 55;
          return (
            <Stack key={d.key} direction="row" alignItems="center" spacing={1.5}>
              <Typography variant="caption" sx={{ width: 16, fontWeight: 700, color: 'text.disabled', textAlign: 'center' }}>
                {fNum(i + 1)}
              </Typography>
              <Typography variant="body2" sx={{ flex: 1, minWidth: 0, color: noData ? 'text.disabled' : 'text.primary' }} noWrap>
                {d.label}
              </Typography>
              <Box sx={{ width: { xs: 64, sm: 96 }, flexShrink: 0, height: 6, borderRadius: 1, bgcolor: alpha(theme.palette.grey[500], 0.16), position: 'relative' }}>
                {!noData && (
                  <Box
                    sx={{
                      position: 'absolute',
                      insetInlineStart: 0,
                      top: 0,
                      bottom: 0,
                      width: `${Math.min(100, d.value)}%`,
                      borderRadius: 1,
                      bgcolor: above ? tone : alpha(theme.palette.grey[500], 0.6),
                    }}
                  />
                )}
                {/* "normal" marker at 50 */}
                <Box sx={{ position: 'absolute', insetInlineStart: '50%', top: -2, bottom: -2, width: 1.5, bgcolor: 'text.disabled' }} />
              </Box>
              <Typography
                variant="body2"
                sx={{ width: 64, textAlign: 'end', fontWeight: 700, color: noData ? 'text.disabled' : 'text.primary' }}
              >
                {noData ? 'بدون داده' : fNum(d.value)}
              </Typography>
            </Stack>
          );
        })}
      </Stack>
    </WidgetCard>
  );
}
