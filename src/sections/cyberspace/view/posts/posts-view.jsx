'use client';

import { useState } from 'react';

import Stack from '@mui/material/Stack';

import { usePosts, useCategories } from 'src/api/dashboard';
import { DashboardContent } from 'src/layouts/dashboard';

import { PostsList } from '../../posts/posts-list';
import { CategoryChart } from '../../posts/category-chart';
import { PlatformSummary } from '../../posts/platform-summary';
import { InfluencerMapping } from '../../posts/influencer-mapping';
import { ControversialPosts } from '../../posts/controversial-posts';
import { ViralPosts } from '../../posts/viral-posts';
import { PostsSearchDialog } from '../../posts/posts-search-dialog';

// ----------------------------------------------------------------------

function getSinceDate(timeFilter) {
  const now = new Date();
  switch (timeFilter) {
    case '24h': {
      const d = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      d.setMinutes(0, 0, 0); // round to the hour
      return d.toISOString();
    }
    case '7d': {
      const d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      d.setHours(0, 0, 0, 0); // round to the day
      return d.toISOString();
    }
    case '30d': {
      const d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      d.setHours(0, 0, 0, 0);
      return d.toISOString();
    }
    default:
      return undefined; // 'all'
  }
}

export function PostsView() {
  const [filters, setFilters] = useState({ keyword: '', username: '', emotion: '' });
  const [searchOpen, setSearchOpen] = useState(false);
  const [timeFilter, setTimeFilter] = useState('all');

  const since = getSinceDate(timeFilter);

  const { data: postsResponse, isLoading } = usePosts({
    limit: 50,
    keyword: filters.keyword || undefined,
    username: filters.username || undefined,
    emotion: filters.emotion || undefined,
    since,
  });

  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();

  const data = postsResponse?.data || [];
  const pagination = postsResponse?.pagination;
  // Only show loading spinner on initial load, not on refetch
  const showLoading = isLoading && data.length === 0;

  const handleApplySearch = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setSearchOpen(false);
  };

  const handleClearSearch = () => {
    setFilters({ keyword: '', username: '', emotion: '' });
  };

  return (
    <DashboardContent>
      <Stack spacing={2.5} sx={{ pb: 10 }}>
        <PlatformSummary data={data} loading={showLoading} />
        <CategoryChart data={categoriesData} loading={categoriesLoading} />
        <InfluencerMapping data={data} loading={showLoading} />
        <PostsList
          data={data}
          loading={showLoading}
          total={pagination?.total}
          filters={filters}
          timeFilter={timeFilter}
          onTimeFilterChange={setTimeFilter}
          onSearchOpen={() => setSearchOpen(true)}
          onClearSearch={handleClearSearch}
        />
        <ControversialPosts data={data} loading={showLoading} />
        <ViralPosts data={data} loading={showLoading} />
      </Stack>

      <PostsSearchDialog
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onApply={handleApplySearch}
        onClear={handleClearSearch}
        filters={filters}
      />
    </DashboardContent>
  );
}
