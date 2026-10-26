import axios from 'axios';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

// Shared profile-scope state. The ProfileScope provider updates this via
// setActiveProfileId() so every axios call carries the right tenant id.
let _activeProfileId = null;

/** Read from storage at boot so a page reload preserves the picker. */
if (typeof window !== 'undefined') {
  try {
    _activeProfileId = sessionStorage.getItem('selectedProfileId') || null;
  } catch {
    /* ignore */
  }
}

export function setActiveProfileId(id) {
  _activeProfileId = id || null;
  if (typeof window !== 'undefined') {
    try {
      if (id) sessionStorage.setItem('selectedProfileId', id);
      else sessionStorage.removeItem('selectedProfileId');
    } catch {
      /* ignore */
    }
  }
}

export function getActiveProfileId() {
  return _activeProfileId;
}

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: CONFIG.serverUrl });

axiosInstance.interceptors.request.use((config) => {
  if (_activeProfileId && !config.headers?.['X-Profile-Id']) {
    config.headers = config.headers || {};
    config.headers['X-Profile-Id'] = _activeProfileId;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => {
    // بک‌اند response رو توی { meta, data } wrap می‌کنه
    // اینجا data واقعی رو extract می‌کنیم
    if (response.data?.meta && 'data' in response.data) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    const status = error.response?.status;

    // Expired or revoked session: send the user back to sign-in instead of
    // leaving every widget in an error state. Sign-in itself returns 401 for
    // wrong credentials, so it is excluded.
    if (status === 401 && typeof window !== 'undefined' && !error.config?.url?.includes('/auth/sign-in')) {
      try {
        sessionStorage.removeItem('jwt_access_token');
      } catch {
        /* ignore */
      }
      if (!window.location.pathname.startsWith('/auth/')) {
        const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/auth/jwt/sign-in/?returnTo=${returnTo}`;
      }
    }

    let message =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      'خطایی رخ داده است';

    if (!error.response) {
      // Network failure, CORS or proxy timeout — the request never got a reply
      message = error.code === 'ECONNABORTED'
        ? 'پاسخ سرور بیش از حد طول کشید. لطفاً دوباره تلاش کنید.'
        : 'ارتباط با سرور برقرار نشد. اتصال اینترنت را بررسی کنید.';
    } else if (status >= 500 && !error.response?.data?.error?.message) {
      message = 'خطای داخلی سرور. لطفاً کمی بعد دوباره تلاش کنید.';
    }

    // Callers expect a plain string message
    return Promise.reject(Array.isArray(message) ? message.join('، ') : message);
  }
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args) => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args];
    const res = await axiosInstance.get(url, { ...config });
    return res.data;
  } catch (error) {
    console.error('Failed to fetch:', error);
    throw error;
  }
};

// ----------------------------------------------------------------------

export const endpoints = {
  auth: {
    me: '/api/auth/me',
    signIn: '/api/auth/sign-in',
    changePassword: '/api/auth/change-password',
  },
  stats: '/api/stats',
  topPosts: '/api/stats/top-posts',
  hashtags: '/api/stats/hashtags',
  sources: '/api/stats/sources',
  userDistribution: '/api/stats/user-distribution',
  emotions: '/api/emotions',
  posts: '/api/posts',
  categories: '/api/posts/categories',
  profile: '/api/profile',
  influencers: '/api/influencers',

  // -------- admin --------
  admin: {
    accessibleProfiles: '/api/admin/accessible-profiles',
    profiles: '/api/admin/profiles',
    profile: (id) => `/api/admin/profiles/${id}`,
    profileSampleCsv: '/api/admin/profiles/sample-csv',
    profileBatchImport: '/api/admin/profiles/batch-import',
    users: '/api/admin/users',
    user: (id) => `/api/admin/users/${id}`,
    userResetPassword: (id) => `/api/admin/users/${id}/reset-password`,
    userDeactivate: (id) => `/api/admin/users/${id}/deactivate`,
    dataSources: '/api/admin/data-sources',
    dataSource: (id) => `/api/admin/data-sources/${id}`,
    dataSourceTest: (id) => `/api/admin/data-sources/${id}/test`,
    dataSourceRunNow: (id) => `/api/admin/data-sources/${id}/run-now`,
    dataSourcePages: (id) => `/api/admin/data-sources/${id}/pages`,
    dataSourceToggle: (id) => `/api/admin/data-sources/${id}/toggle`,
    dataSourceSearch: (id) => `/api/admin/data-sources/${id}/search`,
    globalContext: '/api/admin/global-context',
    globalContextKey: (key) => `/api/admin/global-context/${key}`,
    ingestSettings: '/api/admin/global-context/ingest-settings',
    auditLog: '/api/admin/audit-log',
    ingestRunNow: (id) => `/api/admin/ingest/profiles/${id}/run`,
    ingestRuns: (id) => `/api/admin/ingest/profiles/${id}/runs`,
    ingestLatestRun: (id) => `/api/admin/ingest/profiles/${id}/runs/latest`,
    ingestTrend: (id, hours) => `/api/admin/ingest/profiles/${id}/trend${hours ? `?hours=${hours}` : ''}`,
  },
  usageEvents: '/api/usage/events',
  adminUsage: {
    summary:          (qs) => `/api/admin/usage/summary${qs ? `?${qs}` : ''}`,
    profilesRanking:  (qs) => `/api/admin/usage/profiles-ranking${qs ? `?${qs}` : ''}`,
    featuresRanking:  (qs) => `/api/admin/usage/features-ranking${qs ? `?${qs}` : ''}`,
    daily:            (qs) => `/api/admin/usage/daily${qs ? `?${qs}` : ''}`,
    byProfile:        (profileId, qs) => `/api/admin/usage/by-profile/${profileId}${qs ? `?${qs}` : ''}`,
  },
};
