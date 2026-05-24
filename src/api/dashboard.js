import { use, useMemo } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';

import axios, { endpoints, getActiveProfileId } from 'src/lib/axios';

import { ProfileScopeContext } from 'src/auth/context/profile-scope-context';

// ----------------------------------------------------------------------
// Helper: returns the currently active profile id from the scope context.
// Falls back to the module-level value so hooks outside the provider still work.
function useActiveProfileId() {
  const ctx = use(ProfileScopeContext);
  return ctx?.activeProfileId ?? getActiveProfileId();
}

// ----------------------------------------------------------------------

export function useStats() {
  const profileId = useActiveProfileId();
  return useQuery({
    queryKey: ['stats', profileId],
    queryFn: async () => {
      const res = await axios.get(endpoints.stats);
      return res.data;
    },
  });
}

// ----------------------------------------------------------------------

export function useEmotions() {
  const profileId = useActiveProfileId();
  return useQuery({
    queryKey: ['emotions', profileId],
    queryFn: async () => {
      const res = await axios.get(endpoints.emotions);
      return res.data;
    },
  });
}

// ----------------------------------------------------------------------

export function usePosts({ limit = 20, offset = 0, emotion, keyword, username, since, source } = {}) {
  const profileId = useActiveProfileId();
  return useQuery({
    queryKey: ['posts', profileId, { limit, offset, emotion, keyword, username, since, source }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('limit', String(limit));
      params.set('offset', String(offset));
      if (emotion) params.set('emotion', emotion);
      if (keyword) params.set('keyword', keyword);
      if (username) params.set('username', username);
      if (since) params.set('since', since);
      if (source) params.set('source', source);

      const res = await axios.get(`${endpoints.posts}?${params.toString()}`);
      return res.data;
    },
    placeholderData: keepPreviousData,
  });
}

// ----------------------------------------------------------------------

export function useProfile() {
  const profileId = useActiveProfileId();
  return useQuery({
    queryKey: ['profile', profileId],
    queryFn: async () => {
      const res = await axios.get(endpoints.profile);
      return res.data;
    },
  });
}

// ----------------------------------------------------------------------

export function useInfluencers(limit = 10) {
  const profileId = useActiveProfileId();
  return useQuery({
    queryKey: ['influencers', profileId, limit],
    queryFn: async () => {
      const res = await axios.get(`${endpoints.influencers}?limit=${limit}`);
      return res.data;
    },
  });
}

// ----------------------------------------------------------------------

export function useInfluencerMap(limit = 20) {
  const profileId = useActiveProfileId();
  return useQuery({
    queryKey: ['influencer-map', profileId, limit],
    queryFn: async () => {
      const res = await axios.get(`${endpoints.influencers}/map?limit=${limit}`);
      return res.data;
    },
  });
}

// ----------------------------------------------------------------------

export function useTopPosts(limit = 10, timeframe = 'all') {
  const profileId = useActiveProfileId();
  return useQuery({
    queryKey: ['top-posts', profileId, limit, timeframe],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: String(limit) });
      if (timeframe && timeframe !== 'all') {
        const hours = { '24h': 24, '7d': 168, '30d': 720 }[timeframe];
        if (hours) {
          const d = new Date(Date.now() - hours * 3600_000);
          d.setMinutes(0, 0, 0);
          params.set('since', d.toISOString());
        }
      }
      const res = await axios.get(`${endpoints.topPosts}?${params.toString()}`);
      return res.data;
    },
    retry: 1,
  });
}

// ----------------------------------------------------------------------

export function useTopCommented(limit = 20, timeframe = 'all') {
  const profileId = useActiveProfileId();
  return useQuery({
    queryKey: ['top-commented', profileId, limit, timeframe],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: String(limit) });
      if (timeframe && timeframe !== 'all') {
        const hours = { '24h': 24, '7d': 168, '30d': 720 }[timeframe];
        if (hours) {
          const d = new Date(Date.now() - hours * 3600_000);
          d.setMinutes(0, 0, 0);
          params.set('since', d.toISOString());
        }
      }
      const res = await axios.get(`/api/stats/top-commented?${params.toString()}`);
      return res.data;
    },
    retry: 1,
  });
}

// ----------------------------------------------------------------------

export function useTopForwarded(limit = 20, timeframe = 'all') {
  const profileId = useActiveProfileId();
  return useQuery({
    queryKey: ['top-forwarded', profileId, limit, timeframe],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: String(limit) });
      if (timeframe && timeframe !== 'all') {
        const hours = { '24h': 24, '7d': 168, '30d': 720 }[timeframe];
        if (hours) {
          const d = new Date(Date.now() - hours * 3600_000);
          d.setMinutes(0, 0, 0);
          params.set('since', d.toISOString());
        }
      }
      const res = await axios.get(`/api/stats/top-forwarded?${params.toString()}`);
      return res.data;
    },
    retry: 1,
  });
}

// ----------------------------------------------------------------------

export function useHashtags(limit = 10) {
  const profileId = useActiveProfileId();
  return useQuery({
    queryKey: ['hashtags', profileId, limit],
    queryFn: async () => {
      const res = await axios.get(`${endpoints.hashtags}?limit=${limit}`);
      return res.data;
    },
  });
}

// ----------------------------------------------------------------------

export function useSourceStats(timeframe) {
  const profileId = useActiveProfileId();
  return useQuery({
    queryKey: ['platform-totals', profileId, timeframe],
    queryFn: async () => {
      const tf = timeframe || 'week';
      const res = await axios.get(`/api/stats/platform-totals?timeframe=${tf}`);
      return (res.data || []).map((item) => ({
        source: item.source,
        count: item.count,
      }));
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

// ----------------------------------------------------------------------

export function useUserDistribution() {
  const profileId = useActiveProfileId();
  return useQuery({
    queryKey: ['user-distribution', profileId],
    queryFn: async () => {
      const res = await axios.get(endpoints.userDistribution);
      return res.data;
    },
  });
}

// ----------------------------------------------------------------------

export function useCrisisMetrics() {
  const profileId = useActiveProfileId();
  return useQuery({
    queryKey: ['crisis-metrics', profileId],
    queryFn: async () => {
      const res = await axios.get('/api/stats/crisis');
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!profileId,
  });
}

// ----------------------------------------------------------------------

export function useCategories() {
  const profileId = useActiveProfileId();
  return useQuery({
    queryKey: ['categories', profileId],
    queryFn: async () => {
      const res = await axios.get(endpoints.categories);
      return res.data;
    },
  });
}

// ----------------------------------------------------------------------

export function useAiContent(section) {
  const { data: profile } = useProfile();
  const orgId = profile?.promticIdentifier?.external_id ?? null;

  return useQuery({
    queryKey: ['ai-content', section, orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const url = `/api/ai-content/generate?section=${section}&org_id=${orgId}`;
      const res = await axios.get(url);
      return res.data?.debug ?? res.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

// ----------------------------------------------------------------------

export function useTrendData(profileId, hours = 168) {
  return useQuery({
    queryKey: ['trend', profileId, hours],
    queryFn: async () => {
      if (!profileId) return null;
      const res = await axios.get(`/api/admin/ingest/profiles/${profileId}/trend?hours=${hours}`);
      return res.data;
    },
    enabled: !!profileId,
    staleTime: 10 * 60 * 1000,
  });
}

// ----------------------------------------------------------------------

export function useOfficialPosts({ limit = 50, offset = 0, source } = {}) {
  const profileId = useActiveProfileId();
  return useQuery({
    queryKey: ['official-posts', profileId, { limit, offset, source }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('limit', String(limit));
      params.set('offset', String(offset));
      if (source) params.set('source', source);
      const res = await axios.get(`/api/posts/official?${params.toString()}`);
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}


// ----------------------------------------------------------------------

export function usePromisePerception() {
  const profileId = useActiveProfileId();
  return useQuery({
    queryKey: ['promise-perception', profileId],
    queryFn: async () => {
      const res = await axios.get('/api/stats/promise-perception');
      return res.data;
    },
    enabled: !!profileId,
    staleTime: 10 * 60 * 1000,
  });
}

// ----------------------------------------------------------------------

export function useMacroContext() {
  return useQuery({
    queryKey: ['macro-context'],
    queryFn: async () => {
      const res = await axios.get('/api/admin/ingest/macro-context');
      return res.data;
    },
    staleTime: 30 * 60 * 1000, // 30 min — updates twice daily
  });
}

// ----------------------------------------------------------------------

export function useScenarioStarters() {
  const profileId = useActiveProfileId();
  const { data: macroData } = useMacroContext();
  const { data: profile } = useProfile();

  // Generate context-aware starters from macro context events + profile
  return useMemo(() => {
    const profileName = profile?.name || 'این شخصیت';
    const starters = [];

    // From macro context events
    if (macroData?.today) {
      try {
        const parsed = JSON.parse(macroData.today);
        if (parsed?.events?.length > 0) {
          const topEvent = parsed.events[0];
          starters.push(`اگر ${topEvent.title} بر ${profileName} تأثیر بگذارد، واکنش افکار عمومی چیست؟`);
        }
        if (parsed?.tensions?.foreign) {
          starters.push(`با توجه به تنش‌های خارجی جاری، اگر ${profileName} موضع‌گیری کند چه اتفاقی می‌افتد؟`);
        }
        if (parsed?.forecast) {
          starters.push(`اگر پیش‌بینی ${parsed.forecast.slice(0, 40)}... محقق شود، ${profileName} چه باید بکند؟`);
        }
      } catch { /* ignore parse errors */ }
    }

    // Generic fallbacks
    const fallbacks = [
      `اگر ${profileName} یک مصاحبه جنجالی بدهد چه باید کرد؟`,
      `اگر یک اتفاق رسانه‌ای منفی درباره ${profileName} منتشر شود واکنش چیست؟`,
      `اگر ${profileName} موضع جدیدی درباره مذاکرات اعلام کند تأثیر آن چیست؟`,
      `اگر قیمت ارز افزایش یابد تأثیر آن بر فضای سیاسی ${profileName} چیست؟`,
    ];

    // Fill up to 4 starters
    for (const fb of fallbacks) {
      if (starters.length >= 4) break;
      starters.push(fb);
    }

    return starters.slice(0, 4);
  }, [macroData, profile, profileId]);
}
