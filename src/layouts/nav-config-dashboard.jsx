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
  test: icon('ic-analytics'),
};

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
      { title: 'تست API', path: paths.dashboard.test, icon: ICONS.test },
    ],
  },
];
