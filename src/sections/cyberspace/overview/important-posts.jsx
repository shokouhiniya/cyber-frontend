import { useState } from 'react';

import Box from '@mui/material/Box';

import { useTopPosts } from 'src/api/dashboard';

import { WIDGET_TOOLTIPS } from 'src/components/info-tooltip/widget-tooltips';

import { PostCard, usePostDrawer } from '../shared/post-card';
import { WidgetCard, WidgetToggle } from '../shared/widget-card';

// ----------------------------------------------------------------------

const TIME_FILTERS = [
  { value: '24h', label: '۲۴ ساعت' },
  { value: '7d', label: '۷ روز' },
  { value: '30d', label: '۳۰ روز' },
];

export function ImportantPosts() {
  const { openPost, PostDrawer } = usePostDrawer();
  const [timeframe, setTimeframe] = useState('7d');
  const { data: posts = [], isLoading } = useTopPosts(6, timeframe);

  return (
    <>
      <WidgetCard
        title="پربازدیدترین محتواها"
        icon="solar:star-bold-duotone"
        color="warning"
        tooltip={WIDGET_TOOLTIPS.importantPosts}
        subheader="پست‌های مرتبط با بیشترین بازدید (بدون صفحات رسمی)"
        loading={isLoading}
        empty={!posts.length}
        emptyText="در این بازه پستی ثبت نشده است."
        action={<WidgetToggle value={timeframe} onChange={setTimeframe} options={TIME_FILTERS} />}
      >
        <Box
          sx={{
            display: 'grid',
            gap: 1.5,
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(3, minmax(0, 1fr))' },
          }}
        >
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onClick={() => openPost(post)} />
          ))}
        </Box>
      </WidgetCard>
      {PostDrawer}
    </>
  );
}
