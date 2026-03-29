import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function AISummary({ loading, onActionClick }) {
  const theme = useTheme();

  // Mock AI Summary
  const summary =
    'امروز انتقادات پیرامون موضوع سفرهای خارجی ۱۵٪ افزایش یافته است. در مقابل، رضایت از پروژه‌های عمرانی در حال شکل‌گیری است. احساسات منفی عمدتاً از اکانت‌های با فالوور پایین منتشر شده‌اند.';

  if (loading) {
    return (
      <Card
        sx={{
          p: 2.5,
          borderRadius: 2.5,
          boxShadow: theme.shadows[2],
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 100,
        }}
      >
        <CircularProgress size={24} />
      </Card>
    );
  }

  return (
    <Card
      sx={{
        position: 'relative',
        borderRadius: 2.5,
        overflow: 'hidden',
        boxShadow: theme.shadows[2],
        background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.08)} 100%)`,
        border: `1px solid ${alpha(theme.palette.info.main, 0.16)}`,
      }}
    >
      <Box sx={{ p: 2.5 }}>
        <Stack spacing={1.5}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`,
                boxShadow: `0 4px 12px ${alpha(theme.palette.info.main, 0.24)}`,
              }}
            >
              <Iconify icon="solar:magic-stick-3-bold-duotone" width={20} sx={{ color: '#fff' }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                خلاصه هوش مصنوعی
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 10 }}>
                تحلیل ۲۴ ساعت گذشته
              </Typography>
            </Box>
            <Box
              sx={{
                px: 1,
                py: 0.5,
                borderRadius: 1,
                bgcolor: alpha(theme.palette.info.main, 0.16),
                border: `1px solid ${alpha(theme.palette.info.main, 0.24)}`,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: theme.palette.info.main,
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                      '0%, 100%': { opacity: 1 },
                      '50%': { opacity: 0.5 },
                    },
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{ color: theme.palette.info.main, fontWeight: 700, fontSize: 10 }}
                >
                  AI
                </Typography>
              </Stack>
            </Box>
          </Stack>

          <Typography
            variant="body2"
            sx={{
              color: 'text.primary',
              lineHeight: 1.8,
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            {summary}
          </Typography>

          {/* Action Button */}
          <Button
            variant="contained"
            size="small"
            startIcon={<Iconify icon="solar:lightbulb-bolt-bold-duotone" width={18} />}
            onClick={onActionClick}
            sx={{
              bgcolor: theme.palette.info.main,
              color: '#fff',
              fontWeight: 700,
              fontSize: 12,
              height: 36,
              '&:hover': {
                bgcolor: theme.palette.info.dark,
              },
            }}
          >
            مشاهده اقدامات پیشنهادی
          </Button>
        </Stack>
      </Box>

      {/* Decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          top: -10,
          right: -10,
          width: 60,
          height: 60,
          borderRadius: '50%',
          bgcolor: alpha(theme.palette.info.main, 0.08),
        }}
      />
    </Card>
  );
}
