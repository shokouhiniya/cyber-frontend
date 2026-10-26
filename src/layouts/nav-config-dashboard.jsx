import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => <SvgColor src={`${CONFIG.assetsDir}/assets/icons/navbar/${name}.svg`} />;

const ICONS = {
  dashboard: icon('ic-dashboard'),
  chat: icon('ic-chat'),
  analytics: icon('ic-analytics'),
  blog: icon('ic-blog'),
  file: icon('ic-file'),
  user: icon('ic-user'),
};

// Items in the 'مدیریت' group are restricted by role (client_viewer sees none).
// The nav-section component checks `data.allowedRoles` via `checkPermissions`.
// `canDisplayItemByRole` in layout.jsx returns true (hide) when the user's
// role is NOT in allowedRoles — so we list only the permitted roles.
// Keep in sync with CLIENT_ADMIN_PATHS in app/dashboard/admin/layout.jsx.
const SUPER_ADMIN_ONLY = { allowedRoles: ['super_admin'] };
const ADMINS = { allowedRoles: ['super_admin', 'client_admin'] };

// ----------------------------------------------------------------------

export const navData = [
  {
    subheader: 'داشبورد',
    items: [
      { title: 'داشبورد', path: paths.dashboard.root, icon: ICONS.dashboard },
      { title: 'رسانه', path: paths.dashboard.mypages, icon: ICONS.blog },
      { title: 'پست‌ها', path: paths.dashboard.posts, icon: ICONS.chat },
      { title: 'تحلیل', path: paths.dashboard.analytics, icon: ICONS.analytics },
      { title: 'پیشنهادها', path: paths.dashboard.recommendations, icon: ICONS.blog },
      { title: 'گزارش‌ها', path: paths.dashboard.reports, icon: ICONS.file },
      { title: 'پروفایل', path: paths.dashboard.profile, icon: ICONS.user },
      { title: 'راهنما', path: paths.dashboard.guide, icon: ICONS.file },
    ],
  },
  {
    subheader: 'مدیریت',
    items: [
      { title: 'پروفایل‌ها', path: paths.dashboard.admin.profiles, icon: ICONS.user, ...SUPER_ADMIN_ONLY },
      { title: 'کاربران', path: paths.dashboard.admin.users, icon: ICONS.user, ...ADMINS },
      { title: 'آمار استفاده', path: paths.dashboard.admin.usage, icon: ICONS.analytics, ...ADMINS },
      { title: 'منابع داده', path: paths.dashboard.admin.dataSources, icon: ICONS.file, ...SUPER_ADMIN_ONLY },
      { title: 'تنظیمات', path: paths.dashboard.admin.globalContext, icon: ICONS.blog, ...SUPER_ADMIN_ONLY },
      { title: 'لاگ مدیریتی', path: paths.dashboard.admin.auditLog, icon: ICONS.file, ...SUPER_ADMIN_ONLY },
      { title: 'مستندات فنی', path: paths.dashboard.admin.docs, icon: ICONS.file, ...SUPER_ADMIN_ONLY },
    ],
  },
];
