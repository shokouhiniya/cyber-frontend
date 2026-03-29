import { useQuery } from '@tanstack/react-query';

import axios, { endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const res = await axios.get(endpoints.stats);
      return res.data;
    },
  });
}

// ----------------------------------------------------------------------

export function useEmotions() {
  return useQuery({
    queryKey: ['emotions'],
    queryFn: async () => {
      const res = await axios.get(endpoints.emotions);
      return res.data;
    },
  });
}

// ----------------------------------------------------------------------

export function usePosts({ limit = 20, offset = 0, emotion, keyword, username } = {}) {
  return useQuery({
    queryKey: ['posts', { limit, offset, emotion, keyword, username }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('limit', String(limit));
      params.set('offset', String(offset));
      if (emotion) params.set('emotion', emotion);
      if (keyword) params.set('keyword', keyword);
      if (username) params.set('username', username);

      const res = await axios.get(`${endpoints.posts}?${params.toString()}`);
      return res.data;
    },
  });
}

// ----------------------------------------------------------------------

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await axios.get(endpoints.profile);
      return res.data;
    },
  });
}

// ----------------------------------------------------------------------

export function useInfluencers(limit = 10) {
  return useQuery({
    queryKey: ['influencers', limit],
    queryFn: async () => {
      const res = await axios.get(`${endpoints.influencers}?limit=${limit}`);
      return res.data;
    },
  });
}

// ----------------------------------------------------------------------

export function useTopPosts(limit = 5) {
  return useQuery({
    queryKey: ['top-posts', limit],
    queryFn: async () => {
      const res = await axios.get(`${endpoints.topPosts}?limit=${limit}`);
      return res.data;
    },
  });
}

// ----------------------------------------------------------------------

export function useHashtags(limit = 10) {
  return useQuery({
    queryKey: ['hashtags', limit],
    queryFn: async () => {
      const res = await axios.get(`${endpoints.hashtags}?limit=${limit}`);
      return res.data;
    },
  });
}

// ----------------------------------------------------------------------

export function useSourceStats() {
  return useQuery({
    queryKey: ['source-stats'],
    queryFn: async () => {
      const res = await axios.get(endpoints.sources);
      return res.data;
    },
  });
}

// ----------------------------------------------------------------------

export function useUserDistribution() {
  return useQuery({
    queryKey: ['user-distribution'],
    queryFn: async () => {
      const res = await axios.get(endpoints.userDistribution);
      return res.data;
    },
  });
}
