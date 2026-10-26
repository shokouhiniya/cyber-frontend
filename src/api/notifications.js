'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import axios from 'src/lib/axios';

import { useAuthContext } from 'src/auth/hooks';

// --------------------------------------------------------------------
// In-app notifications — GET /api/notifications, POST :id/read, POST read-all
// --------------------------------------------------------------------

const BASE = '/api/notifications';
const KEY = ['notifications'];

export function useNotifications({ limit = 20 } = {}) {
  const { authenticated } = useAuthContext();
  return useQuery({
    queryKey: [...KEY, { limit }],
    enabled: authenticated,
    queryFn: async () => (await axios.get(`${BASE}?limit=${limit}`)).data,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
    staleTime: 30_000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => (await axios.post(`${BASE}/${id}/read`, null)).data,
    // Optimistic: the badge drops immediately.
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: KEY });
      const prev = qc.getQueriesData({ queryKey: KEY });
      qc.setQueriesData({ queryKey: KEY }, (old) => {
        if (!old?.items) return old;
        const target = old.items.find((n) => n.id === id);
        if (!target || target.readAt) return old;
        return {
          ...old,
          unreadCount: Math.max(0, (old.unreadCount ?? 1) - 1),
          items: old.items.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)),
        };
      });
      return { prev };
    },
    onError: (_err, _id, ctx) => ctx?.prev?.forEach(([key, data]) => qc.setQueryData(key, data)),
    onSettled: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => (await axios.post(`${BASE}/read-all`, null)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
