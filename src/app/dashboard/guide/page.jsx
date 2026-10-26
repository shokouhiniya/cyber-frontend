'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { CONFIG } from 'src/global-config';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

import { WidgetCard } from 'src/sections/cyberspace/shared/widget-card';
import { PageHeader } from 'src/sections/cyberspace/shared/page-header';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

const BACKEND_URL = CONFIG.serverUrl;

const GUIDES = [
  {
    role: 'client_viewer',
    title: 'راهنمای کاربر',
    audience: 'همه کاربران',
    description: 'آشنایی با داشبورد، تحلیل‌ها، گزارش‌گیری و تغییر رمز عبور.',
    file: '01-user-guide.html',
    icon: 'solar:book-bold-duotone',
    color: 'info',
  },
  {
    role: 'client_admin',
    title: 'راهنمای مدیر کلاینت',
    audience: 'مدیران کلاینت',
    description: 'ویرایش پروفایل، مدیریت کلیدواژه‌ها، کانال‌های رسمی و وعده‌ها.',
    file: '02-client-admin-guide.html',
    icon: 'solar:pen-new-square-bold-duotone',
    color: 'success',
  },
  {
    role: 'super_admin',
    title: 'راهنمای مدیر سیستم',
    audience: 'مدیران سیستم',
    description: 'مدیریت کاربران، پروفایل‌ها، منابع داده و عملیات سیستمی.',
    file: '03-super-admin-guide.html',
    icon: 'solar:shield-user-bold-duotone',
    color: 'secondary',
  },
];

// Role hierarchy: super_admin sees all, client_admin sees user + admin, viewer sees user only
function getVisibleGuides(role) {
  if (role === 'super_admin') return GUIDES;
  if (role === 'client_admin') return GUIDES.filter((g) => g.role !== 'super_admin');
  return GUIDES.filter((g) => g.role === 'client_viewer');
}

export default function GuidePage() {
  const { user } = useAuthContext();
  const guides = getVisibleGuides(user?.role);

  return (
    <DashboardContent>
      <Box sx={{ width: 1, maxWidth: 900, mx: 'auto', pb: { xs: 10, lg: 4 } }}>
        <PageHeader
          title="راهنمای استفاده"
          description="مستندات آموزشی سامانه رصد فضای مجازی. هر راهنما در یک برگه جدید باز می‌شود."
          showProfile={false}
        />

        <WidgetCard
          title="راهنماهای در دسترس شما"
          icon="solar:notebook-bold-duotone"
          color="info"
          subheader="بر اساس نقش حساب کاربری شما"
          empty={!guides.length}
          emptyText="راهنمایی برای نقش شما در دسترس نیست."
        >
          <Stack spacing={1.5}>
            {guides.map((guide) => (
              <GuideLink key={guide.file} guide={guide} />
            ))}
          </Stack>
        </WidgetCard>
      </Box>
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

function GuideLink({ guide }) {
  const theme = useTheme();
  const tone = theme.palette[guide.color].main;

  return (
    <Box
      component="a"
      href={`${BACKEND_URL}/docs/user-guides/${guide.file}`}
      target="_blank"
      rel="noopener noreferrer"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: { xs: 2, sm: 2.5 },
        borderRadius: 1.5,
        color: 'inherit',
        textDecoration: 'none',
        border: `1px solid ${alpha(theme.palette.grey[500], 0.16)}`,
        transition: theme.transitions.create(['border-color', 'background-color']),
        '&:hover': { borderColor: tone, bgcolor: alpha(tone, 0.04) },
        '&:focus-visible': { outline: `2px solid ${tone}`, outlineOffset: 2 },
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          flexShrink: 0,
          borderRadius: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: tone,
          bgcolor: alpha(tone, 0.12),
        }}
      >
        <Iconify icon={guide.icon} width={26} />
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1} sx={{ mb: 0.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {guide.title}
          </Typography>
          <Typography
            variant="caption"
            sx={{ fontSize: 12, fontWeight: 600, px: 1, py: 0.25, borderRadius: 1, color: tone, bgcolor: alpha(tone, 0.1) }}
          >
            {guide.audience}
          </Typography>
        </Stack>
        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
          {guide.description}
        </Typography>
      </Box>

      <Iconify icon="eva:external-link-fill" width={20} sx={{ color: 'text.disabled', flexShrink: 0 }} />
    </Box>
  );
}
