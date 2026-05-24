import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { useCrisisMetrics } from 'src/api/dashboard';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const CRISIS_LEVELS = {
  safe:     { label: 'ایمن',    color: '#00AB55', icon: 'solar:shield-check-bold-duotone' },
  warning:  { label: 'هشدار',   color: '#FFAB00', icon: 'solar:danger-triangle-bold-duotone' },
  critical: { label: 'بحرانی',  color: '#FF5630', icon: 'solar:siren-rounded-bold-duotone' },
};

// ── Radar chart ───────────────────────────────────────────────────────────────

function RadarChart({ dimensions, color }) {
  const theme = useTheme();
  if (dimensions.length === 0) return null;

  const cx = 110;
  const cy = 110;
  const R = 80;
  const angleStep = (2 * Math.PI) / dimensions.length;
  const labelR = R + 28;

  const toXY = (i, r) => {
    const angle = i * angleStep - Math.PI / 2;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  const outerPts = dimensions.map((_, i) => toXY(i, R));
  const dataPts  = dimensions.map((d, i) => toXY(i, (d.value / 100) * R));

  const pts = (arr) => arr.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  return (
    <svg width="220" height="220" viewBox="0 0 220 220">
      {/* Grid circles */}
      {[0.25, 0.5, 0.75, 1].map((s, i) => (
        <circle key={i} cx={cx} cy={cy} r={R * s} fill="none"
          stroke={alpha(theme.palette.grey[500], 0.12)} strokeWidth="1" />
      ))}

      {/* Axis lines */}
      {outerPts.map((p, i) => (
        <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y}
          stroke={alpha(theme.palette.grey[500], 0.12)} strokeWidth="1" />
      ))}

      {/* Outer polygon */}
      <polygon points={pts(outerPts)} fill={alpha(color, 0.04)}
        stroke={alpha(color, 0.18)} strokeWidth="1" />

      {/* Data polygon */}
      <polygon points={pts(dataPts)} fill={alpha(color, 0.22)}
        stroke={color} strokeWidth="2" />

      {/* Data dots */}
      {dataPts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill={color} stroke="#fff" strokeWidth="2" />
      ))}

      {/* Labels */}
      {dimensions.map((d, i) => {
        const { x, y } = toXY(i, labelR);
        const anchor = x < cx - 8 ? 'end' : x > cx + 8 ? 'start' : 'middle';
        return (
          <text key={i} x={x} y={y} textAnchor={anchor} dominantBaseline="middle"
            fill={theme.palette.text.primary} fontSize="10" fontWeight="600">
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function CrisisRadar({ loading: parentLoading }) {
  const theme = useTheme();
  const { data, isLoading } = useCrisisMetrics();

  const loading = parentLoading || isLoading;

  if (loading) {
    return (
      <Card sx={{ p: 2.5, borderRadius: 2.5, boxShadow: theme.shadows[2], display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 100 }}>
        <CircularProgress size={24} />
      </Card>
    );
  }

  const level  = data?.level || 'safe';
  const score  = data?.score ?? 0;
  const dims   = data?.dimensions || [];
  const crisis = CRISIS_LEVELS[level] || CRISIS_LEVELS.safe;
  const isCritical = level === 'critical';

  return (
    <Card sx={{
      borderRadius: 2.5, overflow: 'hidden', boxShadow: theme.shadows[2],
      border: `2px solid ${alpha(crisis.color, 0.24)}`,
      animation: isCritical ? 'pulse-border 2s infinite' : 'none',
      '@keyframes pulse-border': {
        '0%, 100%': { borderColor: alpha(crisis.color, 0.24) },
        '50%':      { borderColor: alpha(crisis.color, 0.6) },
      },
    }}>
      {/* Header */}
      <Box sx={{
        p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: `linear-gradient(135deg, ${alpha(crisis.color, isCritical ? 0.12 : 0.07)} 0%, ${alpha(crisis.color, 0.04)} 100%)`,
      }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ width: 36, height: 36, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(crisis.color, 0.16),
            animation: isCritical ? 'pulse 2s infinite' : 'none',
            '@keyframes pulse': { '0%,100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.06)' } },
          }}>
            <Iconify icon={crisis.icon} width={22} sx={{ color: crisis.color }} />
          </Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>رادار بحران</Typography>
        </Stack>

        <Box sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: alpha(crisis.color, 0.14), border: `1px solid ${alpha(crisis.color, 0.24)}` }}>
          <Typography variant="caption" sx={{ color: crisis.color, fontWeight: 700, fontSize: 11 }}>
            {crisis.label} · {score}
          </Typography>
        </Box>
      </Box>

      {/* Radar chart */}
      {dims.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1.5, pb: 1.5 }}>
          <RadarChart dimensions={dims} color={crisis.color} />
        </Box>
      )}

      {/* Empty state */}
      {dims.length === 0 && (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">داده کافی برای محاسبه رادار وجود ندارد.</Typography>
        </Box>
      )}
    </Card>
  );
}
