import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const CONTEXT_ITEMS = [
  {
    text: 'تنش‌های منطقه‌ای در بالاترین سطح ۶ ماه اخیر؛ افزایش حساسیت افکار عمومی به موضوعات امنیتی',
    icon: 'solar:shield-warning-bold',
    severity: 'high',
  },
  {
    text: 'نرخ تورم ماهانه ۳.۲٪ — فشار اقتصادی بر طبقه متوسط محسوس‌تر شده و بحث‌های معیشتی در صدر ترندها قرار دارد',
    icon: 'solar:graph-down-bold',
    severity: 'high',
  },
  {
    text: 'انتخابات شوراها در ۴۵ روز آینده؛ فضای سیاسی قطبی‌تر و حساسیت به مواضع رسمی افزایش یافته',
    icon: 'solar:flag-bold',
    severity: 'medium',
  },
  {
    text: 'موج جدید مهاجرت نخبگان در رسانه‌ها بازتاب گسترده‌ای داشته و احساسات منفی را تقویت کرده',
    icon: 'solar:users-group-rounded-bold',
    severity: 'medium',
  },
  {
    text: 'توافق جدید منطقه‌ای در حوزه انرژی — فرصت روایت‌سازی مثبت در حوزه دیپلماسی',
    icon: 'solar:hand-shake-bold',
    severity: 'low',
  },
];

const SEVERITY_CONFIG = {
  high: { color: '#FF6B6B', label: 'حساس' },
  medium: { color: '#FFA94D', label: 'قابل توجه' },
  low: { color: '#51CF66', label: 'فرصت' },
};

export function MacroContext() {
  const theme = useTheme();

  return (
    <Card sx={{ borderRadius: 2.5, overflow: 'hidden', boxShadow: theme.shadows[2] }}>
      <Box
        sx={{
          p: 2.5,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.warning.main, 0.08)} 100%)`,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ width: 40, height: 40, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.primary.main, 0.16) }}>
            <Iconify icon="solar:globe-bold-duotone" width={24} sx={{ color: theme.palette.primary.main }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>وضعیت کلان</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              بستر سیاسی-اجتماعی حاکم بر فضای رصد
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ p: 2 }}>
        <Stack spacing={1.25}>
          {CONTEXT_ITEMS.map((item, i) => {
            const sev = SEVERITY_CONFIG[item.severity];
            return (
              <Stack
                key={i}
                direction="row"
                alignItems="flex-start"
                spacing={1.5}
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor: alpha(sev.color, 0.04),
                  border: `1px solid ${alpha(sev.color, 0.12)}`,
                  borderRight: `3px solid ${sev.color}`,
                }}
              >
                <Iconify icon={item.icon} width={18} sx={{ color: sev.color, mt: 0.25, flexShrink: 0 }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="caption" sx={{ fontSize: 11, lineHeight: 1.7, color: 'text.primary' }}>
                    {item.text}
                  </Typography>
                </Box>
                <Chip
                  label={sev.label}
                  size="small"
                  sx={{
                    height: 20, fontSize: 8, fontWeight: 700, flexShrink: 0,
                    bgcolor: alpha(sev.color, 0.1),
                    color: sev.color,
                  }}
                />
              </Stack>
            );
          })}
        </Stack>
      </Box>
    </Card>
  );
}
