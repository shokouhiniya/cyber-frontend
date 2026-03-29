import axios from 'axios';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: CONFIG.serverUrl });

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
    const message =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      'خطایی رخ داده است';
    return Promise.reject(message);
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
    signUp: '/api/auth/sign-up',
  },
  stats: '/api/stats',
  topPosts: '/api/stats/top-posts',
  hashtags: '/api/stats/hashtags',
  sources: '/api/stats/sources',
  userDistribution: '/api/stats/user-distribution',
  emotions: '/api/emotions',
  posts: '/api/posts',
  profile: '/api/profile',
  influencers: '/api/influencers',
};
