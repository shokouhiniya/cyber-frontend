'use client';

import { useState } from 'react';

import Stack from '@mui/material/Stack';

import { usePosts } from 'src/api/dashboard';
import { DashboardContent } from 'src/layouts/dashboard';

import { PostsList } from '../../posts/posts-list';
import { PlatformSummary } from '../../posts/platform-summary';
import { InfluencerMapping } from '../../posts/influencer-mapping';
import { PostsSearchDialog } from '../../posts/posts-search-dialog';

// ----------------------------------------------------------------------

export function PostsView() {
  const [filters, setFilters] = useState({ keyword: '', username: '', emotion: '' });
  const [searchOpen, setSearchOpen] = useState(false);

  const { data: postsResponse, isLoading } = usePosts({
    limit: 50,
    keyword: filters.keyword || undefined,
    username: filters.username || undefined,
    emotion: filters.emotion || undefined,
  });

  const data = postsResponse?.data || [];
  const pagination = postsResponse?.pagination;

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
        <PlatformSummary data={data} loading={isLoading} />
        <InfluencerMapping data={data} loading={isLoading} />
        <PostsList
          data={data}
          loading={isLoading}
          total={pagination?.total}
          filters={filters}
          onSearchOpen={() => setSearchOpen(true)}
          onClearSearch={handleClearSearch}
        />
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
