'use client';

import { fShort } from 'src/utils/format-number-fa';

import { useTopCommented } from 'src/api/dashboard';

import { SENTIMENT_COLORS } from 'src/components/chart';
import { WIDGET_TOOLTIPS } from 'src/components/info-tooltip/widget-tooltips';

import { MetricBadge, PostListWidget } from './post-list-widget';

// ----------------------------------------------------------------------

const useMostDiscussed = (timeframe, platform) => useTopCommented(20, timeframe, platform);

// Only colour the card edge when the post has actually been analysed as
// positive or negative; neutral and unanalysed posts get no accent.
function accentFor(post) {
  const s = (post.sentiment || '').toLowerCase();
  if (s === 'positive') return SENTIMENT_COLORS.positive;
  if (s === 'negative') return SENTIMENT_COLORS.negative;
  return undefined;
}

export function ControversialPosts({ platform = null, onClearPlatform }) {
  return (
    <PostListWidget
      title="پربحث‌ترین پست‌ها"
      icon="solar:fire-bold-duotone"
      color="error"
      tooltip={WIDGET_TOOLTIPS.controversialPosts}
      subheader="پست‌هایی با بیشترین کامنت و بحث"
      useData={useMostDiscussed}
      platform={platform}
      onClearPlatform={onClearPlatform}
      getPostProps={(post) => ({
        accentColor: accentFor(post),
        badge: (
          <MetricBadge
            icon="solar:chat-round-dots-bold"
            label={`${fShort(post.replyCount || post.comments_count || 0)} کامنت`}
            color="info"
          />
        ),
      })}
    />
  );
}
