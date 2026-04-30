import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const crisisLevels = {
  safe: {
    label: 'ایمن',
    color: '#00AB55',
    icon: 'solar:shield-check-bold-duotone',
    message: 'وضعیت عادی - نیازی به اقدام فوری نیست',
  },
  warning: {
    label: 'هشدار',
    color: '#FFAB00',
    icon: 'solar:danger-triangle-bold-duotone',
    message: 'افزایش محتوای منفی - نیاز به پایش دقیق‌تر',
  },
  critical: {
    label: 'بحرانی',
    color: '#FF5630',
    icon: 'solar:siren-rounded-bold-duotone',
    message: 'احتمال وقوع بحران رسانه‌ای در ۳ ساعت آینده',
  },
};

export function CrisisRadar({ loading }) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  // Mock crisis level
  const crisisLevel = 'critical'; // actual: 60% negative sentiment = critical
  const crisis = crisisLevels[crisisLevel];

  // Mock radar data (0-100 scale)
  const radarData = [
    { label: 'احساسات منفی', value: 65, max: 100 },
    { label: 'سرعت انتشار', value: 45, max: 100 },
    { label: 'تعداد منابع', value: 30, max: 100 },
    { label: 'تأثیرگذاری', value: 55, max: 100 },
    { label: 'ترند شدن', value: 40, max: 100 },
  ];

  // Mock spike data
  const spikes = [
    { topic: '\u062E\u0637\u0648\u0637 \u0642\u0631\u0645\u0632 \u0645\u0630\u0627\u06A9\u0631\u0627\u062A', increase: '+\u06F4\u06F2\u066A', severity: 'high' },
    { topic: '\u0634\u06A9\u0627\u0641 \u0627\u0635\u0648\u0644\u06AF\u0631\u0627\u06CC\u0627\u0646', increase: '+\u06F3\u06F5\u066A', severity: 'high' },
    { topic: '\u0642\u06CC\u0645\u062A \u0646\u0641\u062A', increase: '+\u06F1\u06F8\u066A', severity: 'medium' },
  ];

  if (loading) {
    return (
      <Card
        sx={{
          p: 2.5,
          borderRadius: 2.5,
          boxShadow: theme.shadows[2],
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 100,
        }}
      >
        <CircularProgress size={24} />
      </Card>
    );
  }

  // Calculate radar chart points
  const centerX = 100;
  const centerY = 100;
  const radius = 80;
  const angleStep = (2 * Math.PI) / radarData.length;

  const maxPoints = radarData
    .map((item, index) => {
      const angle = index * angleStep - Math.PI / 2;
      return {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    })
    .map((p) => `${p.x},${p.y}`)
    .join(' ');

  const dataPoints = radarData
    .map((item, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const r = (item.value / item.max) * radius;
      return {
        x: centerX + r * Math.cos(angle),
        y: centerY + r * Math.sin(angle),
      };
    })
    .map((p) => `${p.x},${p.y}`)
    .join(' ');

  return (
    <Card
      sx={{
        borderRadius: 2.5,
        overflow: 'hidden',
        boxShadow: theme.shadows[2],
        border: `2px solid ${alpha(crisis.color, 0.24)}`,
        animation: crisisLevel === 'critical' ? 'pulse-border 2s infinite' : 'none',
        '@keyframes pulse-border': {
          '0%, 100%': { borderColor: alpha(crisis.color, 0.24) },
          '50%': { borderColor: alpha(crisis.color, 0.6) },
        },
      }}
    >
      <Box
        sx={{
          p: 2.5,
          background:
            crisisLevel === 'critical'
              ? `linear-gradient(135deg, ${alpha(crisis.color, 0.12)} 0%, ${alpha(crisis.color, 0.08)} 100%)`
              : `linear-gradient(135deg, ${alpha(crisis.color, 0.08)} 0%, ${alpha(crisis.color, 0.04)} 100%)`,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(crisis.color, 0.16),
                animation: crisisLevel === 'critical' ? 'pulse 2s infinite' : 'none',
                '@keyframes pulse': {
                  '0%, 100%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.05)' },
                },
              }}
            >
              <Iconify icon={crisis.icon} width={24} sx={{ color: crisis.color }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                رادار بحران
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Box
              sx={{
                px: 1.5,
                py: 0.75,
                borderRadius: 1.5,
                bgcolor: alpha(crisis.color, 0.16),
                border: `1px solid ${alpha(crisis.color, 0.24)}`,
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: crisis.color, fontWeight: 700, fontSize: 11 }}
              >
                {crisis.label}
              </Typography>
            </Box>

            <IconButton
              size="small"
              onClick={() => setExpanded(!expanded)}
              sx={{
                bgcolor: alpha(theme.palette.grey[500], 0.08),
                transition: 'transform 0.3s ease',
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            >
              <Iconify icon="solar:alt-arrow-down-bold" width={20} />
            </IconButton>
          </Stack>
        </Stack>
      </Box>

      {/* Radar Chart */}
      <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'center' }}>
        <svg width="240" height="260" viewBox="-20 -20 240 280" preserveAspectRatio="xMidYMid meet">
          {/* Background circles */}
          {[0.25, 0.5, 0.75, 1].map((scale, i) => (
            <circle
              key={i}
              cx={centerX}
              cy={centerY}
              r={radius * scale}
              fill="none"
              stroke={alpha(theme.palette.grey[500], 0.12)}
              strokeWidth="1"
            />
          ))}

          {/* Axis lines */}
          {radarData.map((item, index) => {
            const angle = index * angleStep - Math.PI / 2;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            return (
              <line
                key={index}
                x1={centerX}
                y1={centerY}
                x2={x}
                y2={y}
                stroke={alpha(theme.palette.grey[500], 0.12)}
                strokeWidth="1"
              />
            );
          })}

          {/* Max area (background) */}
          <polygon
            points={maxPoints}
            fill={alpha(crisis.color, 0.04)}
            stroke={alpha(crisis.color, 0.2)}
            strokeWidth="1"
          />

          {/* Data area */}
          <polygon
            points={dataPoints}
            fill={alpha(crisis.color, 0.24)}
            stroke={crisis.color}
            strokeWidth="2"
          />

          {/* Data points */}
          {radarData.map((item, index) => {
            const angle = index * angleStep - Math.PI / 2;
            const r = (item.value / item.max) * radius;
            const x = centerX + r * Math.cos(angle);
            const y = centerY + r * Math.sin(angle);
            return (
              <circle key={index} cx={x} cy={y} r="4" fill={crisis.color} stroke="#fff" strokeWidth="2" />
            );
          })}

          {/* Labels */}
          {radarData.map((item, index) => {
            const angle = index * angleStep - Math.PI / 2;
            const labelRadius = radius + 35;
            const x = centerX + labelRadius * Math.cos(angle);
            const y = centerY + labelRadius * Math.sin(angle);
            
            // Adjust text anchor based on position
            let textAnchor = 'middle';
            if (x < centerX - 10) textAnchor = 'end';
            if (x > centerX + 10) textAnchor = 'start';
            
            return (
              <text
                key={index}
                x={x}
                y={y}
                textAnchor={textAnchor}
                dominantBaseline="middle"
                fill={theme.palette.mode === 'dark' ? '#fff' : '#212B36'}
                fontSize="12"
                fontWeight="700"
                style={{
                  textShadow: theme.palette.mode === 'dark' 
                    ? '0 0 8px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.9)' 
                    : '0 0 8px rgba(255,255,255,0.9), 0 0 4px rgba(255,255,255,0.9)',
                }}
              >
                {item.label}
              </text>
            );
          })}
        </svg>
      </Box>

      <Box sx={{ px: 2.5, pb: 2.5 }}>
        <Typography
          variant="body2"
          sx={{
            color: 'text.primary',
            lineHeight: 1.6,
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          {crisis.message}
        </Typography>
      </Box>

      <Collapse in={expanded} timeout="auto">
        <Box
          sx={{
            px: 2.5,
            pb: 2.5,
            pt: 0,
            borderTop: `1px dashed ${alpha(theme.palette.grey[500], 0.2)}`,
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 1.5, mt: 2 }}
          >
            تغییرات ناگهانی
          </Typography>
          <Stack spacing={1}>
            {spikes.map((spike, index) => {
              const severityColor =
                spike.severity === 'high'
                  ? theme.palette.error.main
                  : spike.severity === 'medium'
                    ? theme.palette.warning.main
                    : theme.palette.info.main;

              return (
                <Stack
                  key={index}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    bgcolor: alpha(severityColor, 0.08),
                    border: `1px solid ${alpha(severityColor, 0.16)}`,
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: severityColor,
                      }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 12 }}>
                      {spike.topic}
                    </Typography>
                  </Stack>
                  <Typography
                    variant="caption"
                    sx={{
                      color: severityColor,
                      fontWeight: 700,
                      fontSize: 11,
                      bgcolor: alpha(severityColor, 0.12),
                      px: 1,
                      py: 0.25,
                      borderRadius: 1,
                    }}
                  >
                    {spike.increase}
                  </Typography>
                </Stack>
              );
            })}
          </Stack>
        </Box>
      </Collapse>
    </Card>
  );
}
