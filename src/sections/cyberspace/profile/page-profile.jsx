import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function PageProfile({ profileData, loading }) {
  const theme = useTheme();

  if (loading) {
    return (
      <Stack spacing={2.5} sx={{ pb: 10 }}>
        <Card sx={{ p: 3, borderRadius: 2.5 }}>
          <Typography>در حال بارگذاری...</Typography>
        </Card>
      </Stack>
    );
  }

  return (
    <Stack spacing={2.5} sx={{ pb: 10 }}>
      {/* Profile Header */}
      <Card
        sx={{
          borderRadius: 2.5,
          overflow: 'hidden',
          boxShadow: theme.shadows[8],
        }}
      >
        {/* Cover */}
        <Box
          sx={{
            height: 120,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            position: 'relative',
          }}
        />

        {/* Avatar & Info */}
        <Box sx={{ p: 3, mt: -6 }}>
          <Stack spacing={2}>
            <Stack direction="row" alignItems="flex-end" justifyContent="space-between">
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  border: `4px solid ${theme.palette.background.paper}`,
                  boxShadow: theme.shadows[8],
                  fontSize: 36,
                  fontWeight: 700,
                  bgcolor: alpha(theme.palette.primary.main, 0.16),
                  color: theme.palette.primary.main,
                }}
              >
                {profileData?.name?.charAt(0) || 'م'}
              </Avatar>

              <IconButton
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.grey[500], 0.08),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.grey[500], 0.16),
                  },
                }}
              >
                <Iconify icon="solar:pen-bold" width={18} />
              </IconButton>
            </Stack>

            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
                {profileData?.name || 'محمدباقر قالیباف'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                {profileData?.role || 'رئیس مجلس شورای اسلامی'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                {profileData?.organization || 'مجلس شورای اسلامی'}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Card>

      {/* Contact Info */}
      <Card sx={{ p: 3, borderRadius: 2.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
          اطلاعات تماس
        </Typography>

        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                bgcolor: alpha(theme.palette.info.main, 0.12),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Iconify icon="solar:phone-bold-duotone" width={20} sx={{ color: 'info.main' }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                شماره موبایل
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                ۰۹۱۲ ۳۴۵ ۶۷۸۹
              </Typography>
            </Box>
          </Stack>

          <Divider />

          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                bgcolor: alpha(theme.palette.success.main, 0.12),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Iconify icon="solar:letter-bold-duotone" width={20} sx={{ color: 'success.main' }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                ایمیل
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                [email]@example.com
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </Card>

      {/* Social Media */}
      <Card sx={{ p: 3, borderRadius: 2.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
          شبکه‌های اجتماعی
        </Typography>

        <Stack spacing={1.5}>
          {[
            { name: 'توییتر', icon: 'ri:twitter-x-fill', color: '#000000', handle: '@ghalibaf' },
            { name: 'تلگرام', icon: 'ic:baseline-telegram', color: '#0088cc', handle: '@ghalibaf_official' },
            { name: 'اینستاگرام', icon: 'mdi:instagram', color: '#E4405F', handle: '@ghalibaf' },
          ].map((social, index) => (
            <Stack
              key={index}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: alpha(theme.palette.grey[500], 0.04),
                '&:hover': {
                  bgcolor: alpha(theme.palette.grey[500], 0.08),
                },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1,
                    bgcolor: alpha(social.color, 0.12),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Iconify icon={social.icon} width={18} sx={{ color: social.color }} />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {social.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {social.handle}
                  </Typography>
                </Box>
              </Stack>
              <IconButton size="small">
                <Iconify icon="solar:arrow-left-linear" width={18} />
              </IconButton>
            </Stack>
          ))}
        </Stack>
      </Card>

      {/* Settings */}
      <Card sx={{ p: 3, borderRadius: 2.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
          تنظیمات
        </Typography>

        <Stack spacing={1.5}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Iconify icon="solar:lock-password-bold-duotone" width={20} />}
            sx={{
              justifyContent: 'flex-start',
              py: 1.5,
              borderRadius: 1.5,
            }}
          >
            تغییر رمز عبور
          </Button>

          <Button
            fullWidth
            variant="outlined"
            startIcon={<Iconify icon="solar:bell-bold-duotone" width={20} />}
            sx={{
              justifyContent: 'flex-start',
              py: 1.5,
              borderRadius: 1.5,
            }}
          >
            تنظیمات اعلان‌ها
          </Button>

          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<Iconify icon="solar:logout-2-bold-duotone" width={20} />}
            sx={{
              justifyContent: 'flex-start',
              py: 1.5,
              borderRadius: 1.5,
            }}
          >
            خروج از حساب کاربری
          </Button>
        </Stack>
      </Card>
    </Stack>
  );
}
