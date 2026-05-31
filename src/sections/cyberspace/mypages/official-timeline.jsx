import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';
import { InfoTooltip } from 'src/components/info-tooltip';
import { WIDGET_TOOLTIPS } from 'src/components/info-tooltip/widget-tooltips';

import { PostCard, usePostDrawer } from '../shared/post-card';

// ----------------------------------------------------------------------

export function OfficialTimeline({ loading, posts = [] }) {
  const theme = useTheme();
  const { openPost, PostDrawer } = usePostDrawer();
  const [sectionOpen, setSectionOpen] = useState(false);
  const [showCount, setShowCount] = useState(12);

  if (loading) {
    return (
      <Card sx={{ p: 2.5, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120, borderRadius: 2.5, boxShadow: theme.shadows[2] }}>
        <CircularProgress />
      </Card>
    );
  }

  const displayed = posts.slice(0, showCount);
  const hasMore = showCount < posts.length;

  return (
    <>
      <Card sx={{ borderRadius: 2.5, overflow: 'hidden', boxShadow: theme.shadows[2] }}>
        <ButtonBase
          component="div"
          onClick={() => setSectionOpen((prev) => !prev)}
          sx={{
            width: '100%', p: 2.5, display: 'block', textAlign: 'start',
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.success.main, 0.08)} 100%)`,
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box sx={{ width: 40, height: 40, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.primary.main, 0.16) }}>
                <Iconify icon="solar:timeline-up-bold-duotone" width={24} sx={{ color: theme.palette.primary.main }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>تایم‌لاین یکپارچه</Typography>
                <InfoTooltip title={WIDGET_TOOLTIPS.officialTimeline} />
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {posts.length.toLocaleString('fa-IR')} انتشار از صفحات رسمی
                </Typography>
              </Box>
            </Stack>
            <Iconify icon={sectionOpen ? 'solar:alt-arrow-up-bold' : 'solar:alt-arrow-down-bold'} width={20} sx={{ color: 'text.secondary' }} />
          </Stack>
        </ButtonBase>

        <Collapse in={sectionOpen} timeout={350}>
          <Box sx={{ p: 2 }}>
            {posts.length === 0 ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Iconify icon="solar:inbox-line-bold-duotone" width={48} sx={{ color: 'text.disabled', mb: 1 }} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>پستی یافت نشد</Typography>
              </Box>
            ) : (
              <>
                <Stack spacing={1.5}>
                  {displayed.map((post) => (
                    <PostCard key={post.id} post={post} onClick={() => openPost(post)} />
                  ))}
                </Stack>

                {hasMore && (
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Button variant="outlined" size="small" fullWidth onClick={() => setShowCount((c) => c + 12)} startIcon={<Iconify icon="solar:arrow-down-bold" width={16} />} sx={{ fontSize: 11, fontWeight: 600, borderRadius: 1.5 }}>
                      بارگذاری بیشتر ({(posts.length - showCount).toLocaleString('fa-IR')} پست)
                    </Button>
                  </Box>
                )}
              </>
            )}
          </Box>
        </Collapse>
      </Card>
      {PostDrawer}
    </>
  );
}
