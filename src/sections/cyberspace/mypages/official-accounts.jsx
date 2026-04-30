import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const ACCOUNTS = [
  {
    platform: 'توییتر',
    handle: '@ghalibaf',
    icon: 'ri:twitter-x-fill',
    color: '#000000',
    followers: 125400,
    posts: 3842,
    verified: true,
    active: true,
  },
  {
    platform: 'تلگرام',
    handle: 'ghalibaf_official',
    icon: 'ic:baseline-telegram',
    color: '#0088cc',
    followers: 89200,
    posts: 5120,
    verified: true,
    active: true,
  },
  {
    platform: 'اینستاگرام',
    handle: '@ghalibaf',
    icon: 'mdi:instagram',
    color: '#E4405F',
    followers: 210800,
    posts: 1456,
    verified: true,
    active: true,
  },
  {
    platform: 'وب‌سایت',
    handle: 'ghalibaf.ir',
    icon: 'solar:global-bold-duotone',
    color: '#2196F3',
    followers: null,
    posts: 328,
    verified: false,
    active: true,
  },
  {
    platform: 'روبیکا',
    handle: 'ghalibaf',
    icon: 'solar:chat-round-dots-bold-duotone',
    color: '#7C3AED',
    followers: 34500,
    posts: 890,
    verified: false,
    active: false,
  },
];

const formatNum = (n) => {
  if (!n) return '—';
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toLocaleString('fa-IR');
};

export function OfficialAccounts() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const totalFollowers = ACCOUNTS.reduce((sum, a) => sum + (a.followers || 0), 0);
  const totalPosts = ACCOUNTS.reduce((sum, a) => sum + a.posts, 0);

  return (
    <Card sx={{ borderRadius: 2.5, overflow: 'hidden', boxShadow: theme.shadows[2] }}>
      {/* Header */}
      <Box
        sx={{
          p: 2.5,
          background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.08)} 100%)`,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 40, height: 40, borderRadius: 1.5,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: alpha(theme.palette.info.main, 0.16),
              }}
            >
              <Iconify icon="solar:shield-check-bold-duotone" width={24} sx={{ color: theme.palette.info.main }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>صفحات رسمی</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {ACCOUNTS.filter((a) => a.active).length.toLocaleString('fa-IR')} حساب فعال · {formatNum(totalFollowers)} دنبال‌کننده · {formatNum(totalPosts)} انتشار
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </Box>

      {/* Account cards */}
      <Box
        sx={{
          p: 2,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          gap: 1.5,
        }}
      >
        {ACCOUNTS.map((account) => (
          <Box
            key={account.platform}
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(account.color, isDark ? 0.08 : 0.04),
              border: `1px solid ${alpha(account.color, isDark ? 0.24 : 0.12)}`,
              opacity: account.active ? 1 : 0.5,
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: alpha(account.color, isDark ? 0.14 : 0.08),
                transform: 'translateY(-2px)',
                boxShadow: theme.shadows[4],
              },
            }}
          >
            <Stack spacing={1.5}>
              {/* Platform + status */}
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box
                    sx={{
                      width: 32, height: 32, borderRadius: 1,
                      bgcolor: alpha(account.color, 0.16),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Iconify icon={account.icon} width={18} sx={{ color: account.color }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 12, display: 'block', lineHeight: 1.2 }}>
                      {account.platform}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 10, direction: 'ltr', display: 'block' }}>
                      {account.handle}
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={0.5}>
                  {account.verified && (
                    <Iconify icon="solar:verified-check-bold" width={16} sx={{ color: '#1DA1F2' }} />
                  )}
                  <Chip
                    label={account.active ? 'فعال' : 'غیرفعال'}
                    size="small"
                    sx={{
                      height: 20, fontSize: 9, fontWeight: 700,
                      bgcolor: account.active ? alpha('#51CF66', 0.12) : alpha('#FF6B6B', 0.12),
                      color: account.active ? '#51CF66' : '#FF6B6B',
                    }}
                  />
                </Stack>
              </Stack>

              {/* Stats */}
              <Stack direction="row" spacing={2}>
                {account.followers !== null && (
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 9, display: 'block' }}>دنبال‌کننده</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, fontSize: 14, color: account.color }}>
                      {formatNum(account.followers)}
                    </Typography>
                  </Box>
                )}
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 9, display: 'block' }}>انتشار</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, fontSize: 14, color: 'text.primary' }}>
                    {formatNum(account.posts)}
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Box>
        ))}
      </Box>
    </Card>
  );
}
