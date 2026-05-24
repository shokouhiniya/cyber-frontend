import { CONFIG } from 'src/global-config';
import { DashboardLayout } from 'src/layouts/dashboard';

import { AuthGuard } from 'src/auth/guard';
import { ProfileScopeProvider } from 'src/auth/context/profile-scope-provider';

import { UsageTracker } from './usage-tracker';

// ----------------------------------------------------------------------

export default function Layout({ children }) {
  if (CONFIG.auth.skip) {
    return (
      <ProfileScopeProvider>
        <DashboardLayout>
          <UsageTracker />
          {children}
        </DashboardLayout>
      </ProfileScopeProvider>
    );
  }

  return (
    <AuthGuard>
      <ProfileScopeProvider>
        <DashboardLayout>
          <UsageTracker />
          {children}
        </DashboardLayout>
      </ProfileScopeProvider>
    </AuthGuard>
  );
}
