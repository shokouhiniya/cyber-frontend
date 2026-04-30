import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';
import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const PLATFORMS = [
  { name: 'توییتر', icon: 'ri:twitter-x-fill', color: '#000000', mockPosts: 1245, mockViews: 892000 },
  { name: 'تلگرام', icon: 'ic:baseline-telegram', color: '#0088cc', mockPosts: 2380, mockViews: 1450000 },
  { name: 'اینستاگرام', icon: 'mdi:instagram', color: '#E4405F', mockPosts: 876, mockViews: 2130000 },
  { name: 'روبیکا', svg: '/assets/icons/social/rubika-mono.svg', color: '#6C3AED', mockPosts: 1360, mockViews: 980000 },
  { name: 'بله', svg: '/assets/icons/social/bale-mono.svg', color: '#00B4D8', mockPosts: 911, mockViews: 620000 },
  { name: 'ایتا', svg: '/assets/icons/social/eitaa-mono.svg', color: '#FF6F00', mockPosts: 269, mockViews: 185000 },
  { name: 'وب و روزنامه', icon: 'solar:global-bold-duotone', color: '#4CAF50', mockPosts: 534, mockViews: 378000 },
  { name: 'داخلی', icon: 'solar:shield-network-bold-duotone', color: '#7C3AED', mockPosts: 189, mockViews: 124000 },
  { name: 'تلویزیون', icon: 'solar:tv-bold-duotone', color: '#78909C', comingSoon: true },
];

const formatNum = (n) => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return n.toLocaleString('fa-IR');
};

export function PlatformSummary({ data, loading, onPlatformFilter }) {
  const theme = useTheme();

  if (loading) {
    return (
      <Card sx={{ p: 2, borderRadius: 2, boxShadow: theme.shadows[2] }}>
        <CircularProgress size={24} />
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: theme.shadows[2] }}>
      <Box sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Iconify icon="solar:widget-5-bold-duotone" width={20} sx={{ color: theme.palette.primary.main }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>خلاصه پلتفرم‌ها</Typography>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(3, 1fr)', sm: 'repeat(5, 1fr)' },
            gap: 1,
          }}
        >
          {PLATFORMS.map((platform) => (
            <Box
              key={platform.name}
              onClick={() => !platform.comingSoon && onPlatformFilter && onPlatformFilter(platform.name)}
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: alpha(platform.color, platform.comingSoon ? 0.04 : 0.08),
                border: `1px solid ${alpha(platform.color, platform.comingSoon ? 0.08 : 0.16)}`,
                cursor: platform.comingSoon ? 'default' : 'pointer',
                opacity: platform.comingSoon ? 0.6 : 1,
                transition: 'all 0.2s ease',
                ...(!platform.comingSoon && {
                  '&:hover': {
                    bgcolor: alpha(platform.color, 0.16),
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[4],
                  },
                }),
              }}
            >
              <Stack spacing={0.75} alignItems="center">
                <Box
                  sx={{
                    width: 32, height: 32, borderRadius: 1,
                    bgcolor: alpha(platform.color, 0.16),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {platform.svg ? (
                    <SvgColor src={platform.svg} sx={{ width: 18, height: 18, color: platform.color }} />
                  ) : (
                    <Iconify icon={platform.icon} width={18} sx={{ color: platform.color }} />
                  )}
                </Box>

                {platform.comingSoon ? (
                  <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 10, fontWeight: 600, textAlign: 'center', lineHeight: 1.3, mt: 0.5 }}>
                    به زودی ...
                  </Typography>
                ) : (
                  <>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: platform.color, fontSize: 18, lineHeight: 1 }}>
                      {formatNum(platform.mockPosts)}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Iconify icon="solar:eye-bold" width={10} sx={{ color: 'text.disabled' }} />
                      <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 8, fontWeight: 600 }}>
                        {formatNum(platform.mockViews)}
                      </Typography>
                    </Stack>
                  </>
                )}

                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 9 }}>
                  {platform.name}
                </Typography>
              </Stack>
            </Box>
          ))}
        </Box>
      </Box>
    </Card>
  );
}
