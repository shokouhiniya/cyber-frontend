import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function PlatformSummary({ data, loading, onPlatformFilter }) {
  const theme = useTheme();

  if (loading) {
    return (
      <Card sx={{ p: 2, borderRadius: 2, boxShadow: theme.shadows[2] }}>
        <CircularProgress size={24} />
      </Card>
    );
  }

  // Calculate platform stats
  const platformStats = data.reduce((acc, post) => {
    const platform = post.platform || 'توییتر';
    if (!acc[platform]) {
      acc[platform] = { count: 0, likes: 0, retweets: 0 };
    }
    acc[platform].count += 1;
    acc[platform].likes += post.likeCount || 0;
    acc[platform].retweets += post.retweetCount || 0;
    return acc;
  }, {});

  const platforms = [
    {
      name: 'توییتر',
      icon: 'ri:twitter-x-fill',
      color: '#000000',
      stats: platformStats['توییتر'] || { count: 0, likes: 0, retweets: 0 },
    },
    {
      name: 'تلگرام',
      icon: 'ic:baseline-telegram',
      color: '#0088cc',
      stats: platformStats['تلگرام'] || { count: 0, likes: 0, retweets: 0 },
    },
    {
      name: 'اینستاگرام',
      icon: 'mdi:instagram',
      color: '#E4405F',
      stats: platformStats['اینستاگرام'] || { count: 0, likes: 0, retweets: 0 },
    },
  ];

  return (
    <Card
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: theme.shadows[2],
      }}
    >
      <Box sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Iconify
            icon="solar:widget-5-bold-duotone"
            width={20}
            sx={{ color: theme.palette.primary.main }}
          />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            خلاصه پلتفرم‌ها
          </Typography>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 1,
          }}
        >
          {platforms.map((platform) => (
            <Box
              key={platform.name}
              onClick={() => onPlatformFilter && onPlatformFilter(platform.name)}
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: alpha(platform.color, 0.08),
                border: `1px solid ${alpha(platform.color, 0.16)}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: alpha(platform.color, 0.16),
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[4],
                },
              }}
            >
              <Stack spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1,
                    bgcolor: alpha(platform.color, 0.16),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Iconify icon={platform.icon} width={18} sx={{ color: platform.color }} />
                </Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 800, color: platform.color, fontSize: 18 }}
                >
                  {platform.stats.count}
                </Typography>
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
