'use client';


import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { CONFIG } from 'src/global-config';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

const BACKEND_URL = CONFIG.serverUrl;

const GUIDES = [
  {
    role: 'client_viewer',
    title: 'راهنمای کاربر',
    description: 'آشنایی با داشبورد، تحلیل‌ها، گزارش‌گیری و تغییر رمز عبور',
    file: '01-user-guide.html',
    icon: 'solar:book-bold-duotone',
    color: '#00B8D9',
  },
  {
    role: 'client_admin',
    title: 'راهنمای مدیر کلاینت',
    description: 'ویرایش پروفایل، مدیریت کلیدواژه‌ها، کانال‌های رسمی و وعده‌ها',
    file: '02-client-admin-guide.html',
    icon: 'solar:pen-new-square-bold-duotone',
    color: '#00A76F',
  },
  {
    role: 'super_admin',
    title: 'راهنمای مدیر سیستم',
    description: 'مدیریت کاربران، پروفایل‌ها، منابع داده و عملیات سیستمی',
    file: '03-super-admin-guide.html',
    icon: 'solar:shield-user-bold-duotone',
    color: '#8E33FF',
  },
];

// Role hierarchy: super_admin sees all, client_admin sees user + admin, viewer sees user only
function getVisibleGuides(role) {
  if (role === 'super_admin') return GUIDES;
  if (role === 'client_admin') return GUIDES.filter((g) => g.role !== 'super_admin');
  return GUIDES.filter((g) => g.role === 'client_viewer');
}

export default function GuidePage() {
  const theme = useTheme();
  const { user } = useAuthContext();
  const guides = getVisibleGuides(user?.role);

  const openGuide = (file) => {
    window.open(`${BACKEND_URL}/docs/user-guides/${file}`, '_blank');
  };

  return (
    <DashboardContent>
      <Stack spacing={2.5} sx={{ pb: 10 }}>
        {/* Header */}
        <Card
          sx={{
            p: 2.5, borderRadius: 2.5,
            background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.06)} 100%)`,
            border: `1px solid ${alpha(theme.palette.info.main, 0.12)}`,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{ width: 48, height: 48, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.info.main, 0.16) }}>
              <Iconify icon="solar:book-bold-duotone" width={28} sx={{ color: theme.palette.info.main }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>راهنمای استفاده</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 11 }}>
                مستندات آموزشی سامانه رصد فضای مجازی
              </Typography>
            </Box>
          </Stack>
        </Card>

        {/* Guide cards */}
        {guides.map((guide) => (
          <Card
            key={guide.file}
            sx={{
              p: 2.5, borderRadius: 2,
              cursor: 'pointer',
              border: `1px solid ${alpha(guide.color, 0.16)}`,
              transition: 'all 0.2s',
              '&:hover': { boxShadow: theme.shadows[8], transform: 'translateY(-2px)' },
            }}
            onClick={() => openGuide(guide.file)}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box sx={{ width: 44, height: 44, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(guide.color, 0.12) }}>
                <Iconify icon={guide.icon} width={24} sx={{ color: guide.color }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{guide.title}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 11 }}>{guide.description}</Typography>
              </Box>
              <Iconify icon="solar:arrow-left-bold" width={18} sx={{ color: 'text.disabled' }} />
            </Stack>
          </Card>
        ))}
      </Stack>
    </DashboardContent>
  );
}
