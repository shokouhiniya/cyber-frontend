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

// Items in the 'مدیریت' group are only visible to super_admin.
// The nav-section component checks `data.allowedRoles` via `checkPermissions`.
// `canDisplayItemByRole` in layout.jsx returns true (hide) when the user's
// role is NOT in allowedRoles — so we list only the permitted role.
const SUPER_ADMIN_ONLY = { allowedRoles: ['super_admin'] };

// ----------------------------------------------------------------------

export const navData = [
  {
    subheader: 'داشبورد',
    items: [
      { title: 'نمای کلی', path: paths.dashboard.root, icon: ICONS.dashboard },
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
      { title: 'کاربران', path: paths.dashboard.admin.users, icon: ICONS.user, ...SUPER_ADMIN_ONLY },
      { title: 'منابع داده', path: paths.dashboard.admin.dataSources, icon: ICONS.file, ...SUPER_ADMIN_ONLY },
      { title: 'متغیرهای عمومی', path: paths.dashboard.admin.globalContext, icon: ICONS.blog, ...SUPER_ADMIN_ONLY },
      { title: 'لاگ مدیریتی', path: paths.dashboard.admin.auditLog, icon: ICONS.file, ...SUPER_ADMIN_ONLY },
      { title: 'مستندات فنی', path: paths.dashboard.admin.docs, icon: ICONS.file, ...SUPER_ADMIN_ONLY },
    ],
  },
];
