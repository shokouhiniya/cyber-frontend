'use client';

import { fShort } from 'src/utils/format-number-fa';

import { useTopPosts } from 'src/api/dashboard';

import { WIDGET_TOOLTIPS } from 'src/components/info-tooltip/widget-tooltips';

import { MetricBadge, PostListWidget } from './post-list-widget';

// ----------------------------------------------------------------------

const useMostViewed = (timeframe, platform) => useTopPosts(20, timeframe, platform);

export function MostViewedPosts({ platform = null, onClearPlatform }) {
  return (
    <PostListWidget
      title="پربازدیدترین پست‌ها"
      icon="solar:eye-bold-duotone"
      color="primary"
      tooltip={WIDGET_TOOLTIPS.mostViewedPosts}
      subheader="بیشترین بازدید در بازه انتخابی"
      useData={useMostViewed}
      platform={platform}
      onClearPlatform={onClearPlatform}
      getPostProps={(post) => ({
        badge: <MetricBadge icon="solar:eye-bold" label={`${fShort(post.viewCount)} بازدید`} color="primary" />,
      })}
    />
  );
}
