'use client';

import { fShort } from 'src/utils/format-number-fa';

import { useTopForwarded } from 'src/api/dashboard';

import { WIDGET_TOOLTIPS } from 'src/components/info-tooltip/widget-tooltips';

import { MetricBadge, PostListWidget } from './post-list-widget';

// ----------------------------------------------------------------------

const useMostShared = (timeframe, platform) => useTopForwarded(20, timeframe, platform);

export function ViralPosts({ platform = null, onClearPlatform }) {
  return (
    <PostListWidget
      title="پرتکرارترین پست‌ها"
      icon="solar:share-circle-bold-duotone"
      color="warning"
      tooltip={WIDGET_TOOLTIPS.viralPosts}
      subheader="بیشترین بازنشر و پوشش رسانه‌ای"
      useData={useMostShared}
      platform={platform}
      onClearPlatform={onClearPlatform}
      getPostProps={(post) => ({
        badge: (
          <MetricBadge
            icon="solar:forward-bold"
            label={`${fShort(post.retweetCount || post.shares_count || 0)} بازنشر`}
            color="warning"
          />
        ),
      })}
    />
  );
}
