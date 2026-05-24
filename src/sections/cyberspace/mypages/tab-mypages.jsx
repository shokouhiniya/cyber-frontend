import Stack from '@mui/material/Stack';

import { PromiseTracker } from './promise-tracker';
import { ContentAnalysis } from './content-analysis';
import { OfficialAccounts } from './official-accounts';
import { OfficialTimeline } from './official-timeline';
import { NarrativeGap } from '../analytics/narrative-gap';

// ----------------------------------------------------------------------

export function TabMyPages({ emotionData, loading, officialPosts }) {
  return (
    <Stack spacing={2.5} sx={{ pb: 10 }}>
      <OfficialAccounts />
      <OfficialTimeline loading={loading} posts={officialPosts} />
      <ContentAnalysis loading={loading} posts={officialPosts} />
      <PromiseTracker />
      <NarrativeGap loading={loading} />
    </Stack>
  );
}
