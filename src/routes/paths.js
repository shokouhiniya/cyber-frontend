// ----------------------------------------------------------------------

const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
};

// ----------------------------------------------------------------------

export const paths = {
  // AUTH
  auth: {
    jwt: {
      signIn: `${ROOTS.AUTH}/jwt/sign-in`,
    },
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    posts: `${ROOTS.DASHBOARD}/posts`,
    analytics: `${ROOTS.DASHBOARD}/analytics`,
    recommendations: `${ROOTS.DASHBOARD}/recommendations`,
    reports: `${ROOTS.DASHBOARD}/reports`,
    profile: `${ROOTS.DASHBOARD}/profile`,
    guide: `${ROOTS.DASHBOARD}/guide`,
    mypages: `${ROOTS.DASHBOARD}/mypages`,
    admin: {
      root: `${ROOTS.DASHBOARD}/admin`,
      profiles: `${ROOTS.DASHBOARD}/admin/profiles`,
      users: `${ROOTS.DASHBOARD}/admin/users`,
      dataSources: `${ROOTS.DASHBOARD}/admin/data-sources`,
      globalContext: `${ROOTS.DASHBOARD}/admin/global-context`,
      auditLog: `${ROOTS.DASHBOARD}/admin/audit-log`,
      docs: `${ROOTS.DASHBOARD}/admin/docs`,
    },
  },
};
