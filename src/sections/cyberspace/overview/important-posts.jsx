import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { useTopPosts } from 'src/api/dashboard';

import { Iconify } from 'src/components/iconify';

import { PostCard, usePostDrawer } from '../shared/post-card';

// ----------------------------------------------------------------------

export function ImportantPosts() {
  const theme = useTheme();
  const { openPost, PostDrawer } = usePostDrawer();
  const { data: posts = [], isLoading } = useTopPosts(5);
  const [sectionOpen, setSectionOpen] = useState(false);

  if (isLoading) {
    return (
      <Card sx={{ p: 2, borderRadius: 2, boxShadow: theme.shadows[2], display: 'flex', justifyContent: 'center', minHeight: 80 }}>
        <CircularProgress size={24} />
      </Card>
    );
  }

  return (
    <>
      <Card sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: theme.shadows[2] }}>
        <ButtonBase
          component="div"
          onClick={() => setSectionOpen((prev) => !prev)}
          sx={{ width: '100%', p: 2, display: 'block', textAlign: 'start' }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1}>
              <Iconify icon="solar:star-bold-duotone" width={20} sx={{ color: theme.palette.warning.main }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>پربازدیدترین محتواها</Typography>
            </Stack>
            <Iconify icon={sectionOpen ? 'solar:alt-arrow-up-bold' : 'solar:alt-arrow-down-bold'} width={18} sx={{ color: 'text.secondary' }} />
          </Stack>
        </ButtonBase>

        <Collapse in={sectionOpen} timeout={350}>
          <Box sx={{ px: 2, pb: 2 }}>
            <Stack spacing={1.5}>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} onClick={() => openPost(post)} />
              ))}
            </Stack>
          </Box>
        </Collapse>
      </Card>
      {PostDrawer}
    </>
  );
}
