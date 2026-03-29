import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { useSourceStats } from 'src/api/dashboard';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const SOURCE_CONFIG = {
  Rapid: { name: 'توییتر (Rapid)', icon: 'ri:twitter-x-fill', color: '#1DA1F2' },
  Lifeweb: { name: 'لایف‌وب', icon: 'solar:global-bold-duotone', color: '#0088cc' },
  Twitter: { name: 'توییتر', icon: 'ri:twitter-x-fill', color: '#000000' },
};

const DEFAULT_CONFIG = { name: 'سایر', icon: 'solar:widget-5-bold-duotone', color: '#ADB5BD' };

export function PlatformsChart() {
  const theme = useTheme();
  const { data: sources = [], isLoading } = useSourceStats();

  if (isLoading) {
    return (
      <Card sx={{ p: 2, borderRadius: 2, boxShadow: theme.shadows[2], display: 'flex', justifyContent: 'center', minHeight: 80 }}>
        <CircularProgress size={24} />
      </Card>
    );
  }

  const total = sources.reduce((sum, s) => sum + s.count, 0) || 1;

  return (
    <Card sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: theme.shadows[2] }}>
      <Box sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Iconify icon="solar:widget-5-bold-duotone" width={20} sx={{ color: theme.palette.info.main }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>منابع داده</Typography>
        </Stack>

        <Stack spacing={1.5}>
          {sources.map((item) => {
            const cfg = SOURCE_CONFIG[item.source] || DEFAULT_CONFIG;
            const percentage = ((item.count / total) * 100).toFixed(1);
            return (
              <Box key={item.source}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ width: 28, height: 28, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(cfg.color, 0.12) }}>
                      <Iconify icon={cfg.icon} width={16} sx={{ color: cfg.color }} />
                    </Box>
                    <Typography variant="body2" sx={{ fontSize: 12, fontWeight: 600 }}>{cfg.name}</Typography>
                  </Stack>
                  <Typography variant="caption" sx={{ fontSize: 11, fontWeight: 700 }}>
                    {item.count.toLocaleString('fa-IR')}
                  </Typography>
                </Stack>
                <Box sx={{ width: '100%', height: 6, bgcolor: alpha(cfg.color, 0.08), borderRadius: 1, overflow: 'hidden' }}>
                  <Box sx={{ width: `${percentage}%`, height: '100%', bgcolor: cfg.color, borderRadius: 1, transition: 'width 0.6s ease' }} />
                </Box>
              </Box>
            );
          })}
        </Stack>
      </Box>
    </Card>
  );
}
