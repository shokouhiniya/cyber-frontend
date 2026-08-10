'use client';

import { useProfile } from 'src/api/dashboard';
import { DashboardContent } from 'src/layouts/dashboard';

import { PageProfile } from '../../profile/page-profile';

// ----------------------------------------------------------------------

export function ProfileView() {
  const { data: profileRes, isLoading } = useProfile();

  const profileData = profileRes
    ? {
        name: profileRes.name,
        role: profileRes.role,
        organization: profileRes.organization,
        avatar: profileRes.avatar,
        keywords: profileRes.keywords,
        primaryColor: profileRes.primaryColor,
        tier: profileRes.tier,
        officialChannels: profileRes.officialChannels || [],
        lastUpdate: profileRes.lastUpdate
          ? new Date(profileRes.lastUpdate).toLocaleDateString('fa-IR')
          : '',
      }
    : null;

  return (
    <DashboardContent>
      <PageProfile profileData={profileData} rawProfile={profileRes ?? null} loading={isLoading} />
    </DashboardContent>
  );
}
