import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const POSTING_PATTERNS = [
  { label: 'میانگین انتشار روزانه', value: '۴.۲', icon: 'solar:document-text-bold-duotone' },
  { label: 'بهترین ساعت انتشار', value: '۱۰:۰۰', icon: 'solar:clock-circle-bold-duotone' },
  { label: 'بیشترین تعامل', value: 'اینستاگرام', icon: 'solar:star-bold-duotone' },
  { label: 'نرخ تعامل', value: '۳.۸٪', icon: 'solar:graph-up-bold-duotone' },
];

export function ContentAnalysis({ loading }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (loading) {
    return (
      <Card sx={{ p: 2.5, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120, borderRadius: 2.5, boxShadow: theme.shadows[2] }}>
        <CircularProgress />
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: 2.5, overflow: 'hidden', boxShadow: theme.shadows[2] }}>
      {/* Header */}
      <Box
        sx={{
          p: 2.5,
          background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.08)} 0%, ${alpha(theme.palette.success.main, 0.08)} 100%)`,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 40, height: 40, borderRadius: 1.5,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: alpha(theme.palette.warning.main, 0.16),
            }}
          >
            <Iconify icon="solar:chart-square-bold-duotone" width={24} sx={{ color: theme.palette.warning.main }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>تحلیل محتوای منتشرشده</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              الگوهای انتشار شما
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ p: 2.5 }}>
        {/* Quick stats */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 1.5,
          }}
        >
          {POSTING_PATTERNS.map((stat) => (
            <Box
              key={stat.label}
              sx={{
                p: 1.5, borderRadius: 1.5,
                bgcolor: alpha(theme.palette.grey[500], isDark ? 0.08 : 0.04),
                border: `1px solid ${alpha(theme.palette.grey[500], 0.08)}`,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify icon={stat.icon} width={20} sx={{ color: theme.palette.primary.main }} />
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 9, display: 'block' }}>
                    {stat.label}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, fontSize: 14 }}>
                    {stat.value}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          ))}
        </Box>
      </Box>
    </Card>
  );
}
