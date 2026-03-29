import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function TabReports({ loading }) {
  const theme = useTheme();

  const reports = [
    {
      id: 1,
      title: 'گزارش روزانه',
      description: 'خلاصه فعالیت‌ها و آمار ۲۴ ساعت گذشته',
      icon: 'solar:calendar-bold-duotone',
      color: '#667eea',
      format: 'PDF',
    },
    {
      id: 2,
      title: 'گزارش هفتگی',
      description: 'تحلیل جامع ۷ روز اخیر با نمودارها',
      icon: 'solar:chart-2-bold-duotone',
      color: '#51CF66',
      format: 'Excel',
    },
    {
      id: 3,
      title: 'گزارش ماهانه',
      description: 'گزارش کامل عملکرد یک ماهه',
      icon: 'solar:document-text-bold-duotone',
      color: '#FFA94D',
      format: 'PDF',
    },
    {
      id: 4,
      title: 'گزارش احساسات',
      description: 'تحلیل دقیق توزیع احساسات',
      icon: 'solar:emoji-funny-circle-bold-duotone',
      color: '#74C0FC',
      format: 'PDF',
    },
    {
      id: 5,
      title: 'گزارش اینفلوئنسرها',
      description: 'لیست تاثیرگذارترین کاربران',
      icon: 'solar:users-group-rounded-bold-duotone',
      color: '#FF6B6B',
      format: 'Excel',
    },
    {
      id: 6,
      title: 'گزارش سفارشی',
      description: 'ایجاد گزارش با فیلترهای دلخواه',
      icon: 'solar:settings-bold-duotone',
      color: '#ADB5BD',
      format: 'Custom',
    },
  ];

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={2.5} sx={{ pb: 10 }}>
      {/* Header */}
      <Card
        sx={{
          p: 2.5,
          borderRadius: 2.5,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.12)} 0%, ${alpha(theme.palette.info.main, 0.08)} 100%)`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(theme.palette.primary.main, 0.16),
            }}
          >
            <Iconify
              icon="solar:document-text-bold-duotone"
              width={28}
              sx={{ color: theme.palette.primary.main }}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
              گزارش‌گیری
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 11 }}>
              دریافت گزارش‌های مختلف در فرمت‌های PDF و Excel
            </Typography>
          </Box>
        </Stack>
      </Card>

      {/* Reports Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 1.5,
        }}
      >
        {reports.map((report) => (
          <Card
            key={report.id}
            sx={{
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: theme.shadows[2],
              border: `1px solid ${alpha(report.color, 0.16)}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: theme.shadows[8],
                transform: 'translateY(-2px)',
              },
            }}
          >
            <Box
              sx={{
                p: 2,
                background: `linear-gradient(135deg, ${alpha(report.color, 0.08)} 0%, ${alpha(report.color, 0.02)} 100%)`,
              }}
            >
              <Stack spacing={1.5}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: alpha(report.color, 0.16),
                    }}
                  >
                    <Iconify icon={report.icon} width={24} sx={{ color: report.color }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: 14 }}>
                      {report.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 11 }}>
                      {report.description}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: alpha(report.color, 0.12),
                      border: `1px solid ${alpha(report.color, 0.24)}`,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: report.color, fontWeight: 700, fontSize: 10 }}
                    >
                      {report.format}
                    </Typography>
                  </Box>
                </Stack>

                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Iconify icon="solar:download-bold" width={16} />}
                  sx={{
                    bgcolor: report.color,
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 12,
                    height: 32,
                    '&:hover': {
                      bgcolor: alpha(report.color, 0.8),
                    },
                  }}
                >
                  دریافت گزارش
                </Button>
              </Stack>
            </Box>
          </Card>
        ))}
      </Box>
    </Stack>
  );
}
