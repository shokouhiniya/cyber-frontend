import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function GeoHeatmap({ loading }) {
  const theme = useTheme();

  // Mock data - provinces with activity levels
  const provinces = [
    { name: 'تهران', intensity: 95, posts: 1250, sentiment: 'negative' },
    { name: 'اصفهان', intensity: 72, posts: 680, sentiment: 'neutral' },
    { name: 'خراسان رضوی', intensity: 68, posts: 590, sentiment: 'negative' },
    { name: 'فارس', intensity: 55, posts: 420, sentiment: 'positive' },
    { name: 'آذربایجان شرقی', intensity: 48, posts: 380, sentiment: 'neutral' },
    { name: 'خوزستان', intensity: 42, posts: 310, sentiment: 'negative' },
    { name: 'مازندران', intensity: 38, posts: 280, sentiment: 'positive' },
    { name: 'گیلان', intensity: 32, posts: 220, sentiment: 'neutral' },
  ];

  const getIntensityColor = (intensity) => {
    if (intensity > 80) return '#FF6B6B';
    if (intensity > 60) return '#FFA94D';
    if (intensity > 40) return '#FFD93D';
    return '#51CF66';
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return { icon: 'solar:check-circle-bold', color: '#51CF66' };
      case 'negative':
        return { icon: 'solar:danger-triangle-bold', color: '#FF6B6B' };
      default:
        return { icon: 'solar:minus-circle-bold', color: '#ADB5BD' };
    }
  };

  if (loading) {
    return (
      <Card sx={{ p: 2, borderRadius: 2, boxShadow: theme.shadows[2] }}>
        <CircularProgress size={24} />
      </Card>
    );
  }

  return (
    <Card
      sx={{
        borderRadius: 2.5,
        overflow: 'hidden',
        boxShadow: theme.shadows[2],
      }}
    >
      <Box
        sx={{
          p: 2,
          background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.08)} 0%, ${alpha(theme.palette.error.main, 0.08)} 100%)`,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(theme.palette.success.main, 0.16),
            }}
          >
            <Iconify
              icon="solar:map-point-bold-duotone"
              width={24}
              sx={{ color: theme.palette.success.main }}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              نقشه حرارتی جغرافیایی
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 10 }}>
              Geospatial Heatmap
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ p: 2 }}>
        <Stack spacing={1.5}>
          {provinces.map((province, index) => {
            const sentimentInfo = getSentimentIcon(province.sentiment);
            return (
              <Box
                key={index}
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor: alpha(theme.palette.grey[500], 0.04),
                  border: `1px solid ${alpha(theme.palette.grey[500], 0.08)}`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.grey[500], 0.08),
                    transform: 'translateX(-2px)',
                  },
                }}
              >
                <Stack spacing={1}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Iconify
                        icon="solar:map-point-bold"
                        width={16}
                        sx={{ color: getIntensityColor(province.intensity) }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 12 }}>
                        {province.name}
                      </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Iconify icon={sentimentInfo.icon} width={14} sx={{ color: sentimentInfo.color }} />
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 10 }}>
                        {province.posts.toLocaleString('en-US')} پست
                      </Typography>
                    </Stack>
                  </Stack>

                  <Box
                    sx={{
                      height: 6,
                      borderRadius: 1,
                      bgcolor: alpha(theme.palette.grey[500], 0.08),
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        width: `${province.intensity}%`,
                        height: '100%',
                        bgcolor: getIntensityColor(province.intensity),
                        transition: 'width 0.5s ease',
                      }}
                    />
                  </Box>
                </Stack>
              </Box>
            );
          })}
        </Stack>

        <Box
          sx={{
            mt: 2,
            p: 1.5,
            borderRadius: 1.5,
            bgcolor: alpha(theme.palette.info.main, 0.08),
            border: `1px solid ${alpha(theme.palette.info.main, 0.16)}`,
          }}
        >
          <Stack direction="row" spacing={1}>
            <Iconify
              icon="solar:info-circle-bold"
              width={16}
              sx={{ color: theme.palette.info.main, flexShrink: 0, mt: 0.25 }}
            />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 10, lineHeight: 1.6 }}>
              شدت فعالیت در تهران بسیار بالاتر از سایر استان‌هاست. این می‌تواند نشان‌دهنده یک موضوع محلی باشد.
            </Typography>
          </Stack>
        </Box>

        {/* Legend */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 10, display: 'block', mb: 1 }}>
            راهنمای رنگ‌ها
          </Typography>
          <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
            {[
              { label: 'بحرانی', color: '#FF6B6B' },
              { label: 'بالا', color: '#FFA94D' },
              { label: 'متوسط', color: '#FFD93D' },
              { label: 'پایین', color: '#51CF66' },
            ].map((item, idx) => (
              <Stack key={idx} direction="row" alignItems="center" spacing={0.5}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: 0.5,
                    bgcolor: item.color,
                  }}
                />
                <Typography variant="caption" sx={{ fontSize: 9, color: 'text.secondary' }}>
                  {item.label}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Box>
    </Card>
  );
}
