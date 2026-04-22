import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const getHealthStatus = (score) => {
  if (score >= 70) return { 
    label: 'عالی', 
    color: '#00AB55', 
    icon: 'solar:shield-check-bold-duotone',
    gradient: ['#00AB55', '#007B55']
  };
  if (score >= 40) return { 
    label: 'متوسط', 
    color: '#FFAB00', 
    icon: 'solar:shield-warning-bold-duotone',
    gradient: ['#FFAB00', '#B76E00']
  };
  return { 
    label: 'بحرانی', 
    color: '#FF5630', 
    icon: 'solar:shield-cross-bold-duotone',
    gradient: ['#FF5630', '#B71D18']
  };
};

export function ReputationGauge({ loading }) {
  const theme = useTheme();

  // Mock score (0-100)
  const healthScore = 68;
  const status = getHealthStatus(healthScore);
  const percentage = healthScore;

  if (loading) {
    return (
      <Card
        sx={{
          p: 3,
          borderRadius: 3,
          boxShadow: theme.shadows[8],
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 280,
        }}
      >
        <CircularProgress size={40} />
      </Card>
    );
  }

  return (
    <Card
      sx={{
        position: 'relative',
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: theme.shadows[8],
        background: `linear-gradient(135deg, ${alpha(status.color, 0.08)} 0%, ${alpha(status.color, 0.02)} 100%)`,
      }}
    >
      <Box sx={{ p: 2 }}>
        <Stack spacing={2} alignItems="center">
          {/* Title */}
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, ${status.gradient[0]} 0%, ${status.gradient[1]} 100%)`,
                boxShadow: `0 8px 16px ${alpha(status.color, 0.24)}`,
              }}
            >
              <Iconify icon={status.icon} width={24} sx={{ color: '#fff' }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                شاخص سلامت اعتبار
              </Typography>
            </Box>
          </Stack>

          {/* Gauge Chart - Smaller */}
          <Box sx={{ position: 'relative', width: 140, height: 140 }}>
            {/* Background Circle */}
            <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
              <circle
                cx="70"
                cy="70"
                r="60"
                fill="none"
                stroke={alpha(theme.palette.grey[500], 0.12)}
                strokeWidth="14"
              />
              {/* Progress Circle */}
              <circle
                cx="70"
                cy="70"
                r="60"
                fill="none"
                stroke={`url(#gradient-${healthScore})`}
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={`${(percentage / 100) * 377} 377`}
                style={{
                  transition: 'stroke-dasharray 1s ease-in-out',
                }}
              />
              <defs>
                <linearGradient id={`gradient-${healthScore}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={status.gradient[0]} />
                  <stop offset="100%" stopColor={status.gradient[1]} />
                </linearGradient>
              </defs>
            </svg>

            {/* Center Content */}
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
              }}
            >
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 900,
                  fontSize: 40,
                  lineHeight: 1,
                  background: `linear-gradient(135deg, ${status.gradient[0]} 0%, ${status.gradient[1]} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {healthScore}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 600,
                  fontSize: 10,
                  mt: 0.5,
                  display: 'block',
                }}
              >
                از ۱۰۰
              </Typography>
            </Box>
          </Box>

          {/* Status Badge - Smaller */}
          <Box
            sx={{
              px: 2,
              py: 1,
              borderRadius: 1.5,
              background: `linear-gradient(135deg, ${status.gradient[0]} 0%, ${status.gradient[1]} 100%)`,
              boxShadow: `0 4px 12px ${alpha(status.color, 0.32)}`,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                color: '#fff',
                fontWeight: 700,
                textAlign: 'center',
              }}
            >
              وضعیت: {status.label}
            </Typography>
          </Box>

          {/* Description - Removed */}
        </Stack>
      </Box>
    </Card>
  );
}
