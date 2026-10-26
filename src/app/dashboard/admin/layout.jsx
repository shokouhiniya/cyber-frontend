'use client';

import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { usePathname } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

/** The admin pages a client_admin may open; everything else is super_admin-only. */
const CLIENT_ADMIN_PATHS = [paths.dashboard.admin.users, paths.dashboard.admin.usage];

function canOpen(role, pathname) {
  if (role === 'super_admin') return true;
  if (role === 'client_admin') {
    return CLIENT_ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  }
  return false;
}

/**
 * Client-side gate for every /dashboard/admin/* page.
 * The AuthGuard in the dashboard layout has already enforced authentication;
 * the backend enforces the same rules on every admin endpoint.
 */
export default function AdminLayout({ children }) {
  const { user } = useAuthContext();
  const pathname = usePathname() || '';

  if (!user || canOpen(user.role, pathname)) return <>{children}</>;

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 6, md: 10 } }}>
      <Card sx={{ p: { xs: 4, md: 6 }, textAlign: 'center' }}>
        <Iconify
          icon="solar:shield-cross-bold-duotone"
          width={56}
          sx={{ color: 'error.main', mb: 2 }}
        />
        <Typography variant="h5" sx={{ mb: 1, fontWeight: 800 }}>
          دسترسی ندارید
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          این بخش برای نقش کاربری شما در دسترس نیست.
        </Typography>
        <Button component={RouterLink} href={paths.dashboard.root} variant="contained">
          بازگشت به داشبورد
        </Button>
      </Card>
    </Container>
  );
}
