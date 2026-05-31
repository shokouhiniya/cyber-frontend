'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import axios, { endpoints } from 'src/lib/axios';

// --------------------------------------------------------------------
// Profiles
// --------------------------------------------------------------------

// Helper: sort profiles by sort_name (family name), falling back to last word of name
function sortByFamilyName(profiles) {
  return [...profiles].sort((a, b) => {
    const ka = a.sortName || (a.name || '').split(/\s+/).pop() || '';
    const kb = b.sortName || (b.name || '').split(/\s+/).pop() || '';
    return ka.localeCompare(kb, 'fa');
  });
}

export function useAdminProfiles() {
  return useQuery({
    queryKey: ['admin', 'profiles'],
    queryFn: async () => {
      const data = (await axios.get(endpoints.admin.profiles)).data;
      // Sort client-side as well — backend sorts by sort_name but this ensures
      // correct order even if the backend hasn't restarted yet.
      return Array.isArray(data) ? sortByFamilyName(data) : data;
    },
  });
}

export function useAdminProfile(id) {
  return useQuery({
    queryKey: ['admin', 'profiles', id],
    enabled: !!id,
    queryFn: async () => (await axios.get(endpoints.admin.profile(id))).data,
  });
}

export function useCreateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body) => (await axios.post(endpoints.admin.profiles, body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'profiles'] }),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }) =>
      (await axios.patch(endpoints.admin.profile(id), body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'profiles'] }),
  });
}

export function useArchiveProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => (await axios.post(`${endpoints.admin.profile(id)}/archive`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'profiles'] }),
  });
}

export function useDeleteProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => (await axios.delete(endpoints.admin.profile(id))).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'profiles'] });
      qc.invalidateQueries({ queryKey: ['accessible-profiles'] });
    },
  });
}

// --------------------------------------------------------------------
// Users
// --------------------------------------------------------------------

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => (await axios.get(endpoints.admin.users)).data,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body) => (await axios.post(endpoints.admin.users, body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }) =>
      (await axios.patch(endpoints.admin.user(id), body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
}

export function useResetUserPassword() {
  return useMutation({
    mutationFn: async ({ id, password }) =>
      (await axios.post(endpoints.admin.userResetPassword(id), { password })).data,
  });
}

export function useDeactivateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => (await axios.post(endpoints.admin.userDeactivate(id))).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
}

// --------------------------------------------------------------------
// Data sources
// --------------------------------------------------------------------

export function useAdminDataSources(profileId) {
  return useQuery({
    queryKey: ['admin', 'data-sources', profileId || 'all'],
    queryFn: async () => {
      const url = profileId
        ? `${endpoints.admin.dataSources}?profileId=${profileId}`
        : endpoints.admin.dataSources;
      return (await axios.get(url)).data;
    },
  });
}

export function useCreateDataSource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body) => (await axios.post(endpoints.admin.dataSources, body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'data-sources'] }),
  });
}

export function useUpdateDataSource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }) =>
      (await axios.patch(endpoints.admin.dataSource(id), body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'data-sources'] }),
  });
}

export function useDeleteDataSource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => (await axios.delete(endpoints.admin.dataSource(id))).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'data-sources'] }),
  });
}

export function useToggleDataSource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }) =>
      (await axios.patch(endpoints.admin.dataSourceToggle(id), { isActive })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'data-sources'] }),
  });
}

export function useTestDataSource() {
  return useMutation({
    mutationFn: async ({ id, params }) =>
      (await axios.post(endpoints.admin.dataSourceTest(id), params || {})).data,
  });
}

export function useRunDataSource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, params }) =>
      (await axios.post(endpoints.admin.dataSourceRunNow(id), params || {})).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'data-sources'] }),
  });
}

export function useSearchDataSource() {
  return useMutation({
    mutationFn: async ({ id, params }) =>
      (await axios.post(endpoints.admin.dataSourceSearch(id), params || {})).data,
  });
}

// --------------------------------------------------------------------
// Global context
// --------------------------------------------------------------------

export function useGlobalContext() {
  return useQuery({
    queryKey: ['admin', 'global-context'],
    queryFn: async () => (await axios.get(endpoints.admin.globalContext)).data,
  });
}

export function useIngestSettings() {
  return useQuery({
    queryKey: ['admin', 'ingest-settings'],
    queryFn: async () => (await axios.get(endpoints.admin.ingestSettings)).data,
  });
}

export function useSaveIngestSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body) => (await axios.put(endpoints.admin.ingestSettings, body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'ingest-settings'] }),
  });
}

export function useUpsertGlobalContext() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value }) =>
      (await axios.put(endpoints.admin.globalContextKey(key), { value })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'global-context'] }),
  });
}

export function useDeleteGlobalContext() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (key) => (await axios.delete(endpoints.admin.globalContextKey(key))).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'global-context'] }),
  });
}

// --------------------------------------------------------------------
// Audit log
// --------------------------------------------------------------------

export function useAuditLog(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params.set(k, String(v));
  });
  const qs = params.toString();

  return useQuery({
    queryKey: ['admin', 'audit-log', filters],
    queryFn: async () =>
      (await axios.get(qs ? `${endpoints.admin.auditLog}?${qs}` : endpoints.admin.auditLog)).data,
  });
}

export function useActivityFeed(category) {
  const params = category ? `?category=${category}&limit=100` : '?limit=100';
  return useQuery({
    queryKey: ['admin', 'activity-feed', category],
    queryFn: async () =>
      (await axios.get(`${endpoints.admin.auditLog}/activity-feed${params}`)).data,
    staleTime: 30_000,
  });
}

// --------------------------------------------------------------------
// Usage
// --------------------------------------------------------------------

function buildQs(filters) {
  const p = new URLSearchParams();
  Object.entries(filters || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') p.set(k, String(v));
  });
  return p.toString();
}

export function useUsageSummary(filters) {
  return useQuery({
    queryKey: ['admin', 'usage', 'summary', filters],
    queryFn: async () => (await axios.get(endpoints.adminUsage.summary(buildQs(filters)))).data,
  });
}

export function useUsageFeaturesRanking(filters) {
  return useQuery({
    queryKey: ['admin', 'usage', 'features', filters],
    queryFn: async () => (await axios.get(endpoints.adminUsage.featuresRanking(buildQs(filters)))).data,
  });
}

export function useUsageDaily(filters) {
  return useQuery({
    queryKey: ['admin', 'usage', 'daily', filters],
    queryFn: async () => (await axios.get(endpoints.adminUsage.daily(buildQs(filters)))).data,
  });
}

/** Per-user usage breakdown for a specific profile. */
export function useProfileUsage(profileId, filters) {
  return useQuery({
    queryKey: ['admin', 'usage', 'by-profile', profileId, filters],
    queryFn: async () => (await axios.get(endpoints.adminUsage.byProfile(profileId, buildQs(filters)))).data,
    enabled: !!profileId,
  });
}

// --------------------------------------------------------------------
// Usage event beacon
// --------------------------------------------------------------------

export async function recordUsageEvent({ eventType, eventName, metadata }) {
  try {
    await axios.post(endpoints.usageEvents, { eventType, eventName, metadata });
  } catch (err) {
    // Analytics is best-effort
     
    console.warn('usage event failed:', err);
  }
}

// --------------------------------------------------------------------
// Ingest
// --------------------------------------------------------------------

export function useIngestRunNow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profileId) =>
      (await axios.post(endpoints.admin.ingestRunNow(profileId))).data,
    onSuccess: (_, profileId) => {
      qc.invalidateQueries({ queryKey: ['admin', 'ingest', 'runs', profileId] });
    },
  });
}

export function useIngestRuns(profileId) {
  return useQuery({
    queryKey: ['admin', 'ingest', 'runs', profileId],
    queryFn: async () => (await axios.get(endpoints.admin.ingestRuns(profileId))).data,
    enabled: !!profileId,
  });
}

export function useIngestLatestRun(profileId) {
  return useQuery({
    queryKey: ['admin', 'ingest', 'latest', profileId],
    queryFn: async () => (await axios.get(endpoints.admin.ingestLatestRun(profileId))).data,
    enabled: !!profileId,
    refetchInterval: 30000, // poll every 30s to catch running → completed transitions
  });
}

export function useIngestTrend(profileId, hours = 24) {
  return useQuery({
    queryKey: ['admin', 'ingest', 'trend', profileId, hours],
    queryFn: async () => (await axios.get(endpoints.admin.ingestTrend(profileId, hours))).data,
    enabled: !!profileId,
    staleTime: 5 * 60 * 1000, // 5 min — trend data doesn't change that fast
  });
}
