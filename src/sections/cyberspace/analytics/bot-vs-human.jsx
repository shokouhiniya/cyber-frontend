import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { useUserDistribution } from 'src/api/dashboard';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function BotVsHuman() {
  const theme = useTheme();
  const { data, isLoading } = useUserDistribution();

  if (isLoading || !data) {
    return (
      <Card sx={{ p: 2, borderRadius: 2, boxShadow: theme.shadows[2], display: 'flex', justifyContent: 'center', minHeight: 80 }}>
        <CircularProgress size={24} />
      </Card>
    );
  }

  const segments = [
    { label: 'اینفلوئنسرها', value: data.influencerPercent, count: data.influencers, color: '#667eea', icon: 'solar:verified-check-bold' },
    { label: 'کاربران عادی', value: data.regularPercent, count: data.regular, color: '#51CF66', icon: 'solar:user-bold' },
    { label: 'مشکوک/ربات', value: data.suspiciousPercent, count: data.suspicious, color: '#FF6B6B', icon: 'solar:danger-triangle-bold' },
  ];

  return (
    <Card sx={{ borderRadius: 2.5, overflow: 'hidden', boxShadow: theme.shadows[2] }}>
      <Box sx={{ p: 2, background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.08)} 0%, ${alpha(theme.palette.warning.main, 0.08)} 100%)` }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ width: 40, height: 40, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.info.main, 0.16) }}>
            <Iconify icon="solar:shield-user-bold-duotone" width={24} sx={{ color: theme.palette.info.main }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>تفکیک کاربران</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 10 }}>Bot vs. Human Detection</Typography>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ p: 2 }}>
        <Stack spacing={2}>
          {segments.map((segment, index) => (
            <Box key={index}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify icon={segment.icon} width={18} sx={{ color: segment.color }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 12 }}>{segment.label}</Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 10 }}>
                    {segment.count.toLocaleString('en-US')} پست
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: segment.color }}>{segment.value}%</Typography>
                </Stack>
              </Stack>
              <Box sx={{ height: 8, borderRadius: 1, bgcolor: alpha(theme.palette.grey[500], 0.08), overflow: 'hidden' }}>
                <Box sx={{ width: `${segment.value}%`, height: '100%', bgcolor: segment.color, transition: 'width 0.5s ease' }} />
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>
    </Card>
  );
}
