'use client';

import { useState } from 'react';

import Stack from '@mui/material/Stack';

import { DashboardContent } from 'src/layouts/dashboard';

import { ViralPosts } from '../../posts/viral-posts';
import { PlatformSummary } from '../../posts/platform-summary';
import { MostViewedPosts } from '../../posts/most-viewed-posts';
import { InfluencerMapping } from '../../posts/influencer-mapping';
import { ControversialPosts } from '../../posts/controversial-posts';

// ----------------------------------------------------------------------

export function PostsView() {
  const [activePlatform, setActivePlatform] = useState(null);

  const handlePlatformFilter = (key) => {
    setActivePlatform((prev) => (prev === key ? null : key));
  };

  return (
    <DashboardContent>
      <Stack spacing={2.5} sx={{ pb: 10 }}>
        <PlatformSummary onPlatformFilter={handlePlatformFilter} activePlatform={activePlatform} />
        <InfluencerMapping />
        <MostViewedPosts />
        <ControversialPosts />
        <ViralPosts />
      </Stack>
    </DashboardContent>
  );
}
