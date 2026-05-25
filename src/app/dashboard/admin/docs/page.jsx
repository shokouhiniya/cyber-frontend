'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { CONFIG } from 'src/global-config';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const BACKEND_URL = CONFIG.serverUrl;

const DOCS = [
  {
    title: 'معماری سیستم',
    titleEn: 'System Architecture',
    file: 'SYSTEM_ARCHITECTURE.md',
    description: 'ساختار فنی سامانه شامل بک‌اند، فرانت‌اند، پایگاه داده و ماژول‌های ارتباطی',
    icon: 'solar:server-bold-duotone',
    color: '#00A76F',
  },
  {
    title: 'امنیت و حریم خصوصی',
    titleEn: 'Security & Privacy',
    file: 'SECURITY_AND_PRIVACY.md',
    description: 'رمزنگاری، کنترل دسترسی، حفاظت از داده‌ها و سیاست‌های امنیتی',
    icon: 'solar:shield-check-bold-duotone',
    color: '#FF5630',
  },
  {
    title: 'استقرار و نگهداری',
    titleEn: 'Deployment & Maintenance',
    file: 'DEPLOYMENT_AND_MAINTENANCE.md',
    description: 'راهنمای نصب، پیکربندی، پشتیبان‌گیری و عملیات روزمره',
    icon: 'solar:cloud-upload-bold-duotone',
    color: '#0088CC',
  },
  {
    title: 'بسته‌های استقرار',
    titleEn: 'Deployment Packages',
    file: 'DEPLOYMENT_PACKAGES.md',
    description: 'فهرست کامل بسته‌ها و وابستگی‌های مورد نیاز برای اجرای سامانه',
    icon: 'solar:box-bold-duotone',
    color: '#FFA94D',
  },
  {
    title: 'گزارش آزمون',
    titleEn: 'Test Report',
    file: 'TEST_REPORT.md',
    description: 'نتایج آزمون‌های عملکردی، امنیتی، پایداری و کنترل کیفیت',
    icon: 'solar:checklist-bold-duotone',
    color: '#22C55E',
  },
  {
    title: 'مشخصات API داده',
    titleEn: 'Data API Spec',
    file: 'DATA_API_SPEC.md',
    description: 'مشخصات فنی اتصال به منابع داده و ساختار درخواست‌ها',
    icon: 'solar:code-bold-duotone',
    color: '#8E33FF',
  },
];

export default function AdminDocsPage() {
  const theme = useTheme();

  const handleDownload = (file) => {
    window.open(`${BACKEND_URL}/docs/${file}`, '_blank');
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Box sx={{ width: 48, height: 48, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.primary.main, 0.12) }}>
          <Iconify icon="solar:document-text-bold-duotone" width={28} sx={{ color: theme.palette.primary.main }} />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>مستندات فنی</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            مستندات قراردادی و فنی پروژه — برای دانلود روی هر سند کلیک کنید
          </Typography>
        </Box>
      </Stack>

      {/* Document cards */}
      <Stack spacing={1.5}>
        {DOCS.map((doc) => (
          <Card
            key={doc.file}
            sx={{
              p: 2, borderRadius: 2,
              border: `1px solid ${alpha(doc.color, 0.12)}`,
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': { boxShadow: theme.shadows[6], borderColor: alpha(doc.color, 0.3) },
            }}
            onClick={() => handleDownload(doc.file)}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box sx={{ width: 40, height: 40, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(doc.color, 0.1), flexShrink: 0 }}>
                <Iconify icon={doc.icon} width={22} sx={{ color: doc.color }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{doc.title}</Typography>
                  <Chip label=".md" size="small" sx={{ height: 18, fontSize: 9, fontWeight: 700, bgcolor: alpha(theme.palette.grey[500], 0.08), color: 'text.disabled' }} />
                </Stack>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 11 }}>{doc.description}</Typography>
              </Box>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="solar:download-bold" width={14} />}
                sx={{ fontSize: 10, height: 28, flexShrink: 0, borderColor: alpha(doc.color, 0.3), color: doc.color }}
                onClick={(e) => { e.stopPropagation(); handleDownload(doc.file); }}
              >
                دانلود
              </Button>
            </Stack>
          </Card>
        ))}
      </Stack>

      {/* User guides section */}
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 4, mb: 1.5 }}>
        راهنماهای کاربری (HTML)
      </Typography>
      <Stack spacing={1}>
        {[
          { title: 'راهنمای کاربر', file: 'user-guides/01-user-guide.html', color: '#00B8D9' },
          { title: 'راهنمای مدیر کلاینت', file: 'user-guides/02-client-admin-guide.html', color: '#00A76F' },
          { title: 'راهنمای مدیر سیستم', file: 'user-guides/03-super-admin-guide.html', color: '#8E33FF' },
        ].map((g) => (
          <Card
            key={g.file}
            sx={{ p: 1.5, borderRadius: 1.5, cursor: 'pointer', border: `1px solid ${alpha(g.color, 0.12)}`, '&:hover': { bgcolor: alpha(g.color, 0.04) } }}
            onClick={() => window.open(`${BACKEND_URL}/docs/${g.file}`, '_blank')}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Iconify icon="solar:book-bold-duotone" width={18} sx={{ color: g.color }} />
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 12 }}>{g.title}</Typography>
              <Box sx={{ flex: 1 }} />
              <Iconify icon="solar:arrow-left-bold" width={14} sx={{ color: 'text.disabled' }} />
            </Stack>
          </Card>
        ))}
      </Stack>
    </Container>
  );
}
