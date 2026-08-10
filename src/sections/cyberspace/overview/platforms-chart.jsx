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
  telegram: { name: '\u062A\u0644\u06AF\u0631\u0627\u0645', icon: 'ic:baseline-telegram', color: '#0088cc' },
  bale: { name: '\u0628\u0644\u0647', icon: 'solar:chat-round-dots-bold-duotone', color: '#00B4D8' },
  rubika: { name: '\u0631\u0648\u0628\u06CC\u06A9\u0627', icon: 'solar:chat-square-bold-duotone', color: '#6C3AED' },
  eita: { name: '\u0627\u06CC\u062A\u0627', icon: 'solar:letter-bold-duotone', color: '#FF6F00' },
  news: { name: '\u062E\u0628\u0631\u06AF\u0632\u0627\u0631\u06CC', icon: 'solar:document-text-bold', color: '#4CAF50' },
  instagram: { name: '\u0627\u06CC\u0646\u0633\u062A\u0627\u06AF\u0631\u0627\u0645', icon: 'mdi:instagram', color: '#E4405F' },
  twitter: { name: '\u062A\u0648\u06CC\u06CC\u062A\u0631', icon: 'ri:twitter-x-fill', color: '#000000' },
  newspaper: { name: '\u0631\u0648\u0632\u0646\u0627\u0645\u0647', icon: 'solar:global-bold-duotone', color: '#78909C' },
  video_media: { name: '\u0631\u0633\u0627\u0646\u0647 \u062A\u0635\u0648\u06CC\u0631\u06CC', icon: 'solar:videocamera-record-bold', color: '#FF5722' },
  forum: { name: '\u0641\u0631\u0648\u0645', icon: 'solar:chat-square-bold', color: '#795548' },
};

const DEFAULT_CONFIG = { name: '\u0633\u0627\u06CC\u0631', icon: 'solar:widget-5-bold-duotone', color: '#ADB5BD' };

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
