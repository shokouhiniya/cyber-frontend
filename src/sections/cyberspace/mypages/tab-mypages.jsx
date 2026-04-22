import Stack from '@mui/material/Stack';

import { OfficialAccounts } from './official-accounts';
import { OfficialTimeline } from './official-timeline';
import { ContentAnalysis } from './content-analysis';
import { NarrativeGap } from '../analytics/narrative-gap';

// ----------------------------------------------------------------------

export function TabMyPages({ emotionData, loading }) {
  return (
    <Stack spacing={2.5} sx={{ pb: 10 }}>
      <OfficialAccounts />
      <OfficialTimeline loading={loading} />
      <ContentAnalysis loading={loading} />
      <NarrativeGap loading={loading} />
    </Stack>
  );
}
