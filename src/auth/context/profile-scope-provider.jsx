'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState, useEffect, useCallback } from 'react';

import axios, { endpoints, getActiveProfileId, setActiveProfileId } from 'src/lib/axios';

import { useAuthContext } from 'src/auth/hooks';

import { ProfileScopeContext } from './profile-scope-context';

// ----------------------------------------------------------------------

export function ProfileScopeProvider({ children }) {
  const { authenticated, user } = useAuthContext();
  const queryClient = useQueryClient();

  const [activeProfileId, setActiveId] = useState(() => getActiveProfileId());

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['accessible-profiles', user?.id],
    enabled: authenticated,
    queryFn: async () => {
      const res = await axios.get(endpoints.admin.accessibleProfiles);
      return res.data || [];
    },
    staleTime: 60_000,
  });

  // Make sure the active id is valid against the list; default to the first one.
  useEffect(() => {
    if (!profiles.length) return;
    const valid = profiles.some((p) => p.id === activeProfileId);
    if (!valid) {
      const next = profiles[0]?.id ?? null;
      setActiveProfileId(next);
      setActiveId(next);
    }
  }, [profiles, activeProfileId]);

  const selectProfile = useCallback(
    (id) => {
      setActiveProfileId(id);
      setActiveId(id);
      // Any cached dashboard data is tied to the previous profile — drop it.
      queryClient.invalidateQueries();
    },
    [queryClient]
  );

  const value = useMemo(
    () => ({
      loading: isLoading,
      profiles,
      activeProfileId,
      activeProfile: profiles.find((p) => p.id === activeProfileId) || null,
      canSwitch: profiles.length > 1,
      selectProfile,
    }),
    [isLoading, profiles, activeProfileId, selectProfile]
  );

  return <ProfileScopeContext value={value}>{children}</ProfileScopeContext>;
}
