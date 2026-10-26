'use client';

import { useEffect } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

/**
 * Error boundary for every dashboard page: a rendering error in one page
 * shows this panel inside the layout (sidebar and header keep working)
 * instead of a blank screen.
 */
export default function DashboardError({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <DashboardContent>
      <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ py: 12, textAlign: 'center' }}>
        <Iconify icon="solar:danger-triangle-bold-duotone" width={56} sx={{ color: 'warning.main' }} />
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          نمایش این صفحه با خطا مواجه شد
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 420 }}>
          مشکلی در بارگذاری اطلاعات پیش آمد. دوباره تلاش کنید؛ اگر مشکل ادامه داشت با پشتیبانی تماس بگیرید.
        </Typography>
        <Button
          variant="contained"
          onClick={reset}
          startIcon={<Iconify icon="solar:refresh-bold" width={18} />}
        >
          تلاش دوباره
        </Button>
      </Stack>
    </DashboardContent>
  );
}
