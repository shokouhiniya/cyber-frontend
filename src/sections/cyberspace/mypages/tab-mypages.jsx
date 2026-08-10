import Stack from '@mui/material/Stack';

import { useHiddenWidgets } from 'src/api/dashboard';

import { PromiseTracker } from './promise-tracker';
import { ContentAnalysis } from './content-analysis';
import { OfficialAccounts } from './official-accounts';
import { OfficialTimeline } from './official-timeline';
import { NarrativeGap } from '../analytics/narrative-gap';

// ----------------------------------------------------------------------

export function TabMyPages({ emotionData, loading, officialPosts }) {
  const hidden = useHiddenWidgets();
  return (
    <Stack spacing={2.5} sx={{ pb: 10 }}>
      {!hidden.has('official_accounts') && <OfficialAccounts />}
      {!hidden.has('official_timeline') && <OfficialTimeline loading={loading} posts={officialPosts} />}
      {!hidden.has('content_analysis') && <ContentAnalysis loading={loading} posts={officialPosts} />}
      {!hidden.has('promise_tracker') && <PromiseTracker />}
      {!hidden.has('narrative_gap') && <NarrativeGap loading={loading} />}
    </Stack>
  );
}
